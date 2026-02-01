import { useState, useMemo } from "react";
import {
  Box,
  Flex,
  Text,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Select,
  VStack,
  HStack,
  Badge,
} from "@chakra-ui/react";

// Capteurs avec leur crop factor
const SENSORS: Record<string, { cropFactor: number; width: number; height: number }> = {
  "Plein format (35mm)": { cropFactor: 1, width: 36, height: 24 },
  "APS-C (Canon)": { cropFactor: 1.6, width: 22.3, height: 14.9 },
  "APS-C (Nikon/Sony)": { cropFactor: 1.5, width: 23.6, height: 15.6 },
  "Micro 4/3": { cropFactor: 2, width: 17.3, height: 13 },
  "1 pouce": { cropFactor: 2.7, width: 13.2, height: 8.8 },
};

// Image de paysage (prise à 18mm équiv. FF)
const SAMPLE_IMAGE = "https://apprendre-la-photo.fr/wp-content/uploads/2026/02/paysage_apprendre-la-photo_laurent-breillat.jpg";

// Focale de référence = focale de prise de vue de l'image (18mm FF équivalent)
const REFERENCE_FOCAL_FF = 18;

// Focales min/max du slider (absolu)
const MIN_FOCAL = 7; // Permet d'atteindre ~18mm equiv sur capteur 1 pouce
const MAX_FOCAL = 600;

function App() {
  // L'équivalent FF est la source de vérité (évite les erreurs d'arrondi cumulées)
  const [equivalentFF, setEquivalentFF] = useState(18);
  const [sensorKey, setSensorKey] = useState("Plein format (35mm)");

  const sensor = SENSORS[sensorKey];
  const cropFactor = sensor.cropFactor;

  // Focale minimale pour ce capteur (pour avoir zoom ×1 = 18mm equiv FF)
  const minFocalForSensor = useMemo(() => {
    return Math.round(REFERENCE_FOCAL_FF / cropFactor);
  }, [cropFactor]);

  // Focale réelle dérivée de l'équivalent FF
  const focalLength = useMemo(() => {
    const calculated = Math.round(equivalentFF / cropFactor);
    return Math.max(calculated, minFocalForSensor);
  }, [equivalentFF, cropFactor, minFocalForSensor]);

  // Équivalent plein format (recalculé pour l'affichage, au cas où on a clampé)
  const equivalentFocalLength = Math.round(focalLength * cropFactor);

  // Angle de champ (diagonal) en degrés
  const angleOfView = useMemo(() => {
    const diagonal = Math.sqrt(sensor.width ** 2 + sensor.height ** 2);
    return 2 * Math.atan(diagonal / (2 * focalLength)) * (180 / Math.PI);
  }, [focalLength, sensor]);

  // Calcul du zoom basé sur l'équivalent plein format
  // 18mm FF = zoom 1x (focale de prise de vue de l'image)
  const zoomScale = useMemo(() => {
    return equivalentFocalLength / REFERENCE_FOCAL_FF;
  }, [equivalentFocalLength]);

  // Type d'objectif selon l'équivalent FF
  const lensType = useMemo(() => {
    if (equivalentFocalLength < 20) return "Ultra grand-angle";
    if (equivalentFocalLength < 35) return "Grand-angle";
    if (equivalentFocalLength < 60) return "Standard";
    if (equivalentFocalLength < 90) return "Petit téléobjectif";
    if (equivalentFocalLength < 300) return "Téléobjectif";
    return "Super téléobjectif";
  }, [equivalentFocalLength]);

  const labelStyles = {
    mt: "2",
    ml: "-2.5",
    fontSize: "xs",
  };

  // Fonction pour convertir focale en position slider (log scale)
  const focalToSlider = (f: number) => {
    const minLog = Math.log(MIN_FOCAL);
    const maxLog = Math.log(MAX_FOCAL);
    return ((Math.log(f) - minLog) / (maxLog - minLog)) * 100;
  };

  const sliderToFocal = (s: number) => {
    const minLog = Math.log(MIN_FOCAL);
    const maxLog = Math.log(MAX_FOCAL);
    const focal = Math.round(Math.exp(minLog + (s / 100) * (maxLog - minLog)));
    // Ne pas descendre en-dessous du minimum pour ce capteur
    return Math.max(focal, minFocalForSensor);
  };

  // Quand le slider bouge, mettre à jour l'équivalent FF
  const handleSliderChange = (sliderValue: number) => {
    const newFocal = sliderToFocal(sliderValue);
    const newEquivalent = newFocal * cropFactor;
    // S'assurer que l'équivalent ne descend pas en-dessous de la référence
    setEquivalentFF(Math.max(newEquivalent, REFERENCE_FOCAL_FF));
  };

  // Quand on clique sur un bouton de focale rapide
  const handleQuickFocal = (focal: number) => {
    setEquivalentFF(focal * cropFactor);
  };

  // Position du blocage sur le slider (zone grisée)
  const blockedSliderPosition = focalToSlider(minFocalForSensor);

  // Marques du slider - filtrer celles en-dessous du minimum absolu
  const sliderMarks = [7, 9, 12, 18, 24, 35, 50, 85, 135, 200, 400].filter(f => f >= MIN_FOCAL);

  return (
    <Box>
      <Flex gap={6} direction={{ base: "column", lg: "row" }}>
        {/* Colonne gauche : Visualisations */}
        <Box flex="1">
          {/* Photo avec zoom selon focale - aspect ratio 3:2 */}
          <Box 
            position="relative" 
            borderRadius="lg" 
            overflow="hidden" 
            boxShadow="lg" 
            mb={4}
            paddingBottom="66.67%"
            bg="#212E40"
          >
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              overflow="hidden"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Box
                as="img"
                src={SAMPLE_IMAGE}
                alt="Paysage exemple"
                width="100%"
                height="100%"
                objectFit="cover"
                style={{
                  transform: `scale(${zoomScale})`,
                  transformOrigin: "center center",
                  transition: "transform 0.3s ease-out",
                }}
              />
            </Box>

            {/* Badge capteur */}
            <Badge
              position="absolute"
              top={2}
              left={2}
              bg="#212E40"
              color="white"
              fontSize="xs"
              px={2}
              py={1}
              zIndex={1}
            >
              {sensorKey}
            </Badge>

            {/* Badge équivalence */}
            <Badge
              position="absolute"
              top={2}
              right={2}
              bg="#FB9936"
              color="white"
              fontSize="sm"
              px={2}
              py={1}
              zIndex={1}
            >
              Équiv. {equivalentFocalLength}mm
            </Badge>

            {/* Indicateur de zoom */}
            <Badge
              position="absolute"
              bottom={2}
              right={2}
              bg="rgba(33, 46, 64, 0.8)"
              color="white"
              fontSize="xs"
              px={2}
              py={1}
              zIndex={1}
            >
              Zoom ×{zoomScale.toFixed(1)}
            </Badge>
          </Box>

          {/* Schéma angle de champ */}
          <Box bg="white" p={4} borderRadius="lg" boxShadow="md">
            <Text fontSize="sm" fontWeight="medium" mb={3} color="#212E40">
              Angle de champ : {angleOfView.toFixed(1)}°
            </Text>
            <svg viewBox="0 0 300 120" width="100%" height="120">
              {/* Point de l'appareil */}
              <circle cx="20" cy="60" r="8" fill="#212E40" />
              
              {/* Angle actuel */}
              <path
                d={`M 20 60 L ${20 + 260 * Math.cos((-angleOfView / 2) * Math.PI / 180)} ${60 - 260 * Math.sin((angleOfView / 2) * Math.PI / 180)} L ${20 + 260 * Math.cos((angleOfView / 2) * Math.PI / 180)} ${60 + 260 * Math.sin((angleOfView / 2) * Math.PI / 180)} Z`}
                fill="rgba(251, 153, 54, 0.3)"
                stroke="#FB9936"
                strokeWidth="2"
              />

              {/* Lignes de l'angle */}
              <line
                x1="20"
                y1="60"
                x2={20 + 260 * Math.cos((-angleOfView / 2) * Math.PI / 180)}
                y2={60 - 260 * Math.sin((angleOfView / 2) * Math.PI / 180)}
                stroke="#FB9936"
                strokeWidth="2"
              />
              <line
                x1="20"
                y1="60"
                x2={20 + 260 * Math.cos((angleOfView / 2) * Math.PI / 180)}
                y2={60 + 260 * Math.sin((angleOfView / 2) * Math.PI / 180)}
                stroke="#FB9936"
                strokeWidth="2"
              />

              {/* Texte angle */}
              <text x="150" y="115" textAnchor="middle" fontSize="12" fill="#666">
                {angleOfView.toFixed(1)}° (diagonal)
              </text>
            </svg>
          </Box>
        </Box>

        {/* Colonne droite : Contrôles */}
        <Box w={{ base: "100%", lg: "45%" }}>
          <VStack spacing={6} align="stretch">
            {/* Sélecteur de capteur */}
            <Box>
              <Text fontWeight="medium" fontSize="sm" mb={2}>Taille du capteur</Text>
              <Select
                value={sensorKey}
                onChange={(e) => setSensorKey(e.target.value)}
                borderColor="#212E40"
                _hover={{ borderColor: "#FB9936" }}
                _focus={{ borderColor: "#FB9936", boxShadow: "0 0 0 1px #FB9936" }}
              >
                {Object.keys(SENSORS).map((key) => (
                  <option key={key} value={key}>
                    {key} (×{SENSORS[key].cropFactor})
                  </option>
                ))}
              </Select>
            </Box>

            {/* Slider focale */}
            <Box>
              <Flex justify="space-between" align="center" mb={2}>
                <Text fontWeight="medium" fontSize="sm">Longueur focale</Text>
                <Badge colorScheme="blue" fontSize="md" px={3}>{focalLength}mm</Badge>
              </Flex>
              <Box px={2} pt={2} pb={6} position="relative">
                {/* Zone grisée (focales impossibles pour ce capteur) */}
                {blockedSliderPosition > 0 && (
                  <Box
                    position="absolute"
                    left={0}
                    top="50%"
                    transform="translateY(-50%)"
                    width={`${blockedSliderPosition}%`}
                    height="8px"
                    bg="#ccc"
                    borderRadius="full"
                    zIndex={0}
                    opacity={0.7}
                  />
                )}
                <Slider
                  value={focalToSlider(focalLength)}
                  onChange={handleSliderChange}
                  min={0}
                  max={100}
                  step={0.5}
                >
                  {sliderMarks.map((f) => (
                    <SliderMark 
                      key={f} 
                      value={focalToSlider(f)} 
                      {...labelStyles}
                      color={f < minFocalForSensor ? "#aaa" : "inherit"}
                    >
                      {f}
                    </SliderMark>
                  ))}
                  <SliderTrack bg="#EFF7FB">
                    <SliderFilledTrack bg="#FB9936" />
                  </SliderTrack>
                  <SliderThumb borderColor="#212E40" boxSize={5} />
                </Slider>
              </Box>
            </Box>

            {/* Infos calculées */}
            <Box bg="white" p={4} borderRadius="lg" boxShadow="md">
              <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                  <Text color="#666" fontSize="sm">Focale réelle :</Text>
                  <Text fontWeight="bold" color="#212E40">{focalLength}mm</Text>
                </HStack>
                
                <HStack justify="space-between">
                  <Text color="#666" fontSize="sm">Crop factor :</Text>
                  <Text fontWeight="bold" color="#212E40">×{cropFactor}</Text>
                </HStack>

                <HStack justify="space-between" bg="#FFF5EB" p={2} borderRadius="md">
                  <Text color="#666" fontSize="sm">Équivalent plein format :</Text>
                  <Text fontWeight="bold" color="#FB9936" fontSize="lg">{equivalentFocalLength}mm</Text>
                </HStack>

                <HStack justify="space-between">
                  <Text color="#666" fontSize="sm">Angle de champ :</Text>
                  <Text fontWeight="bold" color="#212E40">{angleOfView.toFixed(1)}°</Text>
                </HStack>

                <HStack justify="space-between">
                  <Text color="#666" fontSize="sm">Type d'objectif :</Text>
                  <Badge bg="#212E40" color="white">{lensType}</Badge>
                </HStack>
              </VStack>
            </Box>

            {/* Tableau de référence rapide */}
            <Box bg="white" p={4} borderRadius="lg" boxShadow="md">
              <Text fontWeight="medium" fontSize="sm" mb={3} color="#212E40">
                Équivalences plein format pour ce capteur
              </Text>
              <Flex wrap="wrap" gap={2}>
                {[9, 12, 18, 24, 35, 50, 85, 135].filter(f => f >= minFocalForSensor).map((f) => (
                  <Box
                    key={f}
                    bg={f === focalLength ? "#FB9936" : "#EFF7FB"}
                    color={f === focalLength ? "white" : "#212E40"}
                    px={3}
                    py={1}
                    borderRadius="md"
                    fontSize="xs"
                    cursor="pointer"
                    onClick={() => handleQuickFocal(f)}
                    _hover={{ bg: f === focalLength ? "#e88a2e" : "#ddd" }}
                  >
                    {f}mm → {Math.round(f * cropFactor)}mm
                  </Box>
                ))}
              </Flex>
            </Box>
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
}

export default App;
