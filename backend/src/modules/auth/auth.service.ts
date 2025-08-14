import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { EmailService } from '../../services/email.service';
import { UserService } from '../user/user.service';
import {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { AuthResponse, JwtPayload } from './interfaces/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, password, firstName, lastName, name } = registerDto;

    // Check if user already exists
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    // Handle name field - split into firstName and lastName if needed
    let userFirstName = firstName;
    let userLastName = lastName;

    if (name && !firstName && !lastName) {
      const nameParts = name.trim().split(' ');
      userFirstName = nameParts[0];
      userLastName = nameParts.slice(1).join(' ') || '';
    }

    // Create user
    const user = await this.userService.createUser({
      email,
      password: hashedPassword,
      firstName: userFirstName,
      lastName: userLastName,
      emailVerificationToken,
      emailVerified: false,
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Save refresh token
    await this.userService.updateRefreshToken(
      (user as any)._id.toString(),
      tokens.refreshToken,
    );

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(
        email,
        emailVerificationToken,
      );
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Don't fail registration if email fails, just log it
    }

    return {
      user: {
        id: (user as any)._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        credits: user.credits,
        emailVerified: user.emailVerified,
      },
      tokens,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Verify password
    if (!user.password) {
      throw new UnauthorizedException(
        'Please use social login for this account',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.userService.updateUser((user as any)._id.toString(), {
      lastLoginAt: new Date(),
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Save refresh token
    await this.userService.updateRefreshToken(
      (user as any)._id.toString(),
      tokens.refreshToken,
    );

    return {
      user: {
        id: (user as any)._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        credits: user.credits,
        emailVerified: user.emailVerified,
      },
      tokens,
    };
  }

  async googleAuth(googleUser: any): Promise<AuthResponse> {
    const { googleId, email, firstName, lastName, avatarUrl, emailVerified } =
      googleUser;

    let user = await this.userService.findByGoogleId(googleId);

    if (!user) {
      // Check if user exists with this email
      const existingUser = await this.userService.findByEmail(email);

      if (existingUser) {
        // Link Google account to existing user
        user = await this.userService.updateUser(
          (existingUser as any)._id.toString(),
          {
            googleId,
            avatarUrl: avatarUrl || existingUser.avatarUrl,
            emailVerified: emailVerified || existingUser.emailVerified,
            lastLoginAt: new Date(),
          },
        );
      } else {
        // Create new user
        user = await this.userService.createUser({
          googleId,
          email,
          firstName,
          lastName,
          avatarUrl,
          emailVerified,
          lastLoginAt: new Date(),
        });
      }
    } else {
      // Update last login
      await this.userService.updateUser((user as any)._id.toString(), {
        lastLoginAt: new Date(),
      });
    }

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Save refresh token
    await this.userService.updateRefreshToken(
      (user as any)._id.toString(),
      tokens.refreshToken,
    );

    return {
      user: {
        id: (user as any)._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        credits: user.credits,
        emailVerified: user.emailVerified,
      },
      tokens,
    };
  }

  async refreshTokens(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.userService.findById(payload.sub);
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user);

      // Update refresh token
      await this.userService.updateRefreshToken(
        (user as any)._id.toString(),
        tokens.refreshToken,
      );

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    await this.userService.updateRefreshToken(userId, null);
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    const user = await this.userService.findByEmail(email);
    if (!user) {
      // Don't reveal that user doesn't exist
      return {
        message:
          'If an account with that email exists, a password reset link has been sent.',
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await this.userService.setPasswordResetToken(
      email,
      resetToken,
      resetExpires,
    );

    // Send password reset email
    try {
      await this.emailService.sendPasswordResetEmail(email, resetToken);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      // Continue silently to avoid revealing email existence
    }

    return {
      message:
        'If an account with that email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { token, newPassword } = resetPasswordDto;

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const user = await this.userService.resetPassword(token, hashedPassword);
    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    return { message: 'Password has been reset successfully' };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.userService.verifyEmail(token);
    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    return { message: 'Email verified successfully' };
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      // Don't reveal that user doesn't exist for security
      return {
        message:
          'If an account with that email exists, a verification email has been sent.',
      };
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    await this.userService.updateUser((user as any)._id.toString(), {
      emailVerificationToken,
    });

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(
        email,
        emailVerificationToken,
      );
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Continue silently to avoid revealing email existence
    }

    return { message: 'Verification email sent successfully' };
  }

  private async generateTokens(
    user: any,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      sub: (user as any)._id.toString(),
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '7d',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn:
          this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
