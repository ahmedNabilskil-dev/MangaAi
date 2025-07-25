function ManualPanelGenerator({
  isOpen,
  onClose,
  projectId,
}: ManualPanelGeneratorProps) {
  const [step, setStep] = useState(1);
  const [selectedChapter, setSelectedChapter] = useState("");
  const [selectedScene, setSelectedScene] = useState("");
  const [panelOrder, setPanelOrder] = useState(1);
  const [maxPanelOrder, setMaxPanelOrder] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  // Panel settings
  const [panelSettings, setPanelSettings] = useState({
    description: "",
    artStyle: "modern, clean anime style",
    background: "",
    lighting: "soft, diffused lighting",
    cameraAngle: "medium shot",
    selectedCharacters: [] as string[],
    characterInteraction: "",
    dialogue: "",
    qualityKeywords: [] as string[],
  });

  // Mock data - replace with actual data from your project
  const mockChapters = [
    { id: "ch1", title: "Chapter 1: The Beginning", sceneCount: 5 },
    { id: "ch2", title: "Chapter 2: New Friends", sceneCount: 4 },
    { id: "ch3", title: "Chapter 3: School Festival", sceneCount: 6 },
  ];

  const mockScenes = {
    ch1: [
      { id: "sc1", title: "Scene 1: Morning Routine", panelCount: 3 },
      { id: "sc2", title: "Scene 2: School Entrance", panelCount: 4 },
      { id: "sc3", title: "Scene 3: First Class", panelCount: 5 },
      { id: "sc4", title: "Scene 4: Lunch Break", panelCount: 2 },
      { id: "sc5", title: "Scene 5: Going Home", panelCount: 3 },
    ],
    ch2: [
      { id: "sc6", title: "Scene 1: New Student", panelCount: 4 },
      { id: "sc7", title: "Scene 2: Introductions", panelCount: 3 },
      { id: "sc8", title: "Scene 3: Classroom", panelCount: 5 },
      { id: "sc9", title: "Scene 4: After School", panelCount: 2 },
    ],
    ch3: [
      { id: "sc10", title: "Scene 1: Festival Preparation", panelCount: 6 },
      { id: "sc11", title: "Scene 2: Setting Up", panelCount: 4 },
      { id: "sc12", title: "Scene 3: Festival Day", panelCount: 8 },
      { id: "sc13", title: "Scene 4: Competition", panelCount: 5 },
      { id: "sc14", title: "Scene 5: Evening", panelCount: 3 },
      { id: "sc15", title: "Scene 6: Fireworks", panelCount: 4 },
    ],
  };

  const mockCharacters = [
    { id: "char1", name: "Akira Yamamoto", description: "Main protagonist" },
    { id: "char2", name: "Yuki Tanaka", description: "Best friend" },
    { id: "char3", name: "Sensei Watanabe", description: "Homeroom teacher" },
    { id: "char4", name: "Hana Sato", description: "Class president" },
    { id: "char5", name: "Ryuu Kimura", description: "Rival character" },
  ];

  const mockLocations = [
    {
      id: "loc1",
      name: "School Rooftop",
      description: "Peaceful rooftop with city view",
    },
    {
      id: "loc2",
      name: "Classroom 2-A",
      description: "Standard high school classroom",
    },
    { id: "loc3", name: "School Cafeteria", description: "Busy lunch area" },
    {
      id: "loc4",
      name: "Cherry Blossom Park",
      description: "Beautiful park with sakura trees",
    },
    {
      id: "loc5",
      name: "Festival Grounds",
      description: "School festival area with stalls",
    },
  ];

  const artStyles = [
    { value: "modern, clean anime style", label: "Modern Anime" },
    { value: "soft, pastel anime illustration", label: "Pastel Anime" },
    { value: "dynamic shonen anime style", label: "Dynamic Shonen" },
    { value: "detailed fantasy anime", label: "Fantasy Anime" },
    { value: "chibi style", label: "Chibi Style" },
  ];

  const lightingOptions = [
    { value: "soft, diffused lighting", label: "Soft Diffused" },
    { value: "bright, natural sunlight", label: "Bright Sunlight" },
    { value: "warm, indoor lighting", label: "Warm Indoor" },
    { value: "dramatic backlighting", label: "Dramatic Backlighting" },
    { value: "evening golden hour", label: "Golden Hour" },
    { value: "moonlight", label: "Moonlight" },
  ];

  const cameraAngles = [
    { value: "medium shot", label: "Medium Shot" },
    { value: "close-up portrait", label: "Close-up Portrait" },
    { value: "full body shot", label: "Full Body Shot" },
    { value: "low angle looking up", label: "Low Angle Hero" },
    { value: "bird's eye view from above", label: "Bird's Eye View" },
  ];

  const qualityKeywords = [
    "high-resolution",
    "8k",
    "detailed",
    "intricate details",
    "masterpiece",
    "best quality",
    "cinematic lighting",
    "photorealistic",
    "ultra-detailed",
    "studio quality",
    "professional artwork",
    "vibrant colors",
    "sharp focus",
  ];

  // Update max panel order when scene changes
  useEffect(() => {
    if (selectedChapter && selectedScene) {
      const scenes =
        mockScenes[selectedChapter as keyof typeof mockScenes] || [];
      const scene = scenes.find((s) => s.id === selectedScene);
      if (scene) {
        const newMaxOrder = scene.panelCount + 1;
        setMaxPanelOrder(newMaxOrder);
        setPanelOrder(newMaxOrder); // Default to adding at the end
      }
    }
  }, [selectedChapter, selectedScene]);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleCharacterToggle = (characterId: string) => {
    setPanelSettings((prev) => ({
      ...prev,
      selectedCharacters: prev.selectedCharacters.includes(characterId)
        ? prev.selectedCharacters.filter((id) => id !== characterId)
        : [...prev.selectedCharacters, characterId],
    }));
  };

  const handleQualityKeywordToggle = (keyword: string) => {
    setPanelSettings((prev) => ({
      ...prev,
      qualityKeywords: prev.qualityKeywords.includes(keyword)
        ? prev.qualityKeywords.filter((k) => k !== keyword)
        : [...prev.qualityKeywords, keyword],
    }));
  };

  const generatePanel = async () => {
    setIsGenerating(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Generating panel:", {
        chapter: selectedChapter,
        scene: selectedScene,
        order: panelOrder,
        settings: panelSettings,
      });
      onClose();
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const resetDialog = () => {
    setStep(1);
    setSelectedChapter("");
    setSelectedScene("");
    setPanelOrder(1);
    setPanelSettings({
      description: "",
      artStyle: "modern, clean anime style",
      background: "",
      lighting: "soft, diffused lighting",
      cameraAngle: "medium shot",
      selectedCharacters: [],
      characterInteraction: "",
      dialogue: "",
      qualityKeywords: [],
    });
  };

  const handleClose = () => {
    resetDialog();
    onClose();
  };

  const currentScenes = selectedChapter
    ? mockScenes[selectedChapter as keyof typeof mockScenes] || []
    : [];
  const canProceed = {
    step1: selectedChapter && selectedScene,
    step2: panelOrder > 0,
    step3: panelSettings.description.trim().length > 0,
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold">Generate Panel Manually</span>
              <DialogDescription className="mt-1">
                Step {step} of 3:{" "}
                {step === 1
                  ? "Select Location"
                  : step === 2
                  ? "Set Panel Order"
                  : "Configure Panel Details"}
              </DialogDescription>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Step 1: Chapter and Scene Selection */}
          {step === 1 && (
            <div className="p-6 space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Choose Chapter and Scene
                </h2>
                <p className="text-gray-600">
                  Select where you want to add your new panel
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Chapter
                  </Label>
                  <Select
                    value={selectedChapter}
                    onValueChange={setSelectedChapter}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a chapter" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockChapters.map((chapter) => (
                        <SelectItem key={chapter.id} value={chapter.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{chapter.title}</span>
                            <Badge variant="secondary" className="ml-2">
                              {chapter.sceneCount} scenes
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Scene
                  </Label>
                  <Select
                    value={selectedScene}
                    onValueChange={setSelectedScene}
                    disabled={!selectedChapter}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a scene" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentScenes.map((scene) => (
                        <SelectItem key={scene.id} value={scene.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{scene.title}</span>
                            <Badge variant="outline" className="ml-2">
                              {scene.panelCount} panels
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedChapter && selectedScene && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-blue-700">
                      <FileText className="w-4 h-4" />
                      <span className="font-medium">Selected:</span>
                    </div>
                    <p className="text-blue-600 mt-1">
                      {
                        mockChapters.find((c) => c.id === selectedChapter)
                          ?.title
                      }{" "}
                      →{" "}
                      {currentScenes.find((s) => s.id === selectedScene)?.title}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 2: Panel Order */}
          {step === 2 && (
            <div className="p-6 space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Set Panel Order
                </h2>
                <p className="text-gray-600">
                  Choose where to insert the new panel in the scene
                </p>
              </div>

              <div className="max-w-md mx-auto">
                <Label className="text-sm font-medium mb-3 block">
                  Panel Position
                </Label>
                <Select
                  value={panelOrder.toString()}
                  onValueChange={(value) => setPanelOrder(parseInt(value))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: maxPanelOrder }, (_, i) => i + 1).map(
                      (order) => (
                        <SelectItem key={order} value={order.toString()}>
                          <div className="flex items-center justify-between w-full">
                            <span>Position {order}</span>
                            {order === maxPanelOrder && (
                              <Badge variant="secondary" className="ml-2">
                                Last
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-2">
                  Current scene has {maxPanelOrder - 1} panels. Adding at
                  position {panelOrder}.
                </p>
              </div>

              <Card className="bg-green-50 border-green-200 max-w-md mx-auto">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <Settings className="w-4 h-4" />
                    <span className="font-medium">Panel Order:</span>
                  </div>
                  <p className="text-green-600 mt-1">
                    Panel will be inserted at position {panelOrder} of{" "}
                    {maxPanelOrder}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Panel Configuration */}
          {step === 3 && (
            <div className="p-6 space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Configure Panel Details
                </h2>
                <p className="text-gray-600">
                  Set up the visual and narrative elements
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Description */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Panel Description *
                    </Label>
                    <Textarea
                      placeholder="Describe what happens in this panel..."
                      value={panelSettings.description}
                      onChange={(e) =>
                        setPanelSettings((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="min-h-[100px]"
                    />
                  </div>

                  {/* Characters */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Characters
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {mockCharacters.map((character) => (
                        <button
                          key={character.id}
                          onClick={() => handleCharacterToggle(character.id)}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            panelSettings.selectedCharacters.includes(
                              character.id
                            )
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="font-medium text-sm">
                            {character.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {character.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location/Background */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Background Location
                    </Label>
                    <Select
                      value={panelSettings.background}
                      onValueChange={(value) =>
                        setPanelSettings((prev) => ({
                          ...prev,
                          background: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockLocations.map((location) => (
                          <SelectItem key={location.id} value={location.name}>
                            <div>
                              <div className="font-medium">{location.name}</div>
                              <div className="text-xs text-gray-500">
                                {location.description}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Art Style */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Art Style
                    </Label>
                    <Select
                      value={panelSettings.artStyle}
                      onValueChange={(value) =>
                        setPanelSettings((prev) => ({
                          ...prev,
                          artStyle: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {artStyles.map((style) => (
                          <SelectItem key={style.value} value={style.value}>
                            {style.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Lighting */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Lighting
                    </Label>
                    <Select
                      value={panelSettings.lighting}
                      onValueChange={(value) =>
                        setPanelSettings((prev) => ({
                          ...prev,
                          lighting: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {lightingOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Camera Angle */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Camera Angle
                    </Label>
                    <Select
                      value={panelSettings.cameraAngle}
                      onValueChange={(value) =>
                        setPanelSettings((prev) => ({
                          ...prev,
                          cameraAngle: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {cameraAngles.map((angle) => (
                          <SelectItem key={angle.value} value={angle.value}>
                            {angle.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dialogue */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Dialogue (Optional)
                    </Label>
                    <Textarea
                      placeholder="Add any dialogue or speech bubbles..."
                      value={panelSettings.dialogue}
                      onChange={(e) =>
                        setPanelSettings((prev) => ({
                          ...prev,
                          dialogue: e.target.value,
                        }))
                      }
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              </div>

              {/* Quality Keywords */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Quality Enhancers (Optional)
                </Label>
                <div className="flex flex-wrap gap-2">
                  {qualityKeywords.map((keyword) => (
                    <Badge
                      key={keyword}
                      variant={
                        panelSettings.qualityKeywords.includes(keyword)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => handleQualityKeywordToggle(keyword)}
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">Step {step} of 3</div>
          <div className="flex gap-3">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {step < 3 ? (
              <Button
                onClick={handleNext}
                disabled={
                  (step === 1 && !canProceed.step1) ||
                  (step === 2 && !canProceed.step2)
                }
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={generatePanel}
                disabled={!canProceed.step3 || isGenerating}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 min-w-[120px]"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4" />
                    Generate Panel
                  </div>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
