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

// Image de paysage pour montrer le cadrage
const SAMPLE_IMAGE = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80";

// Diagonale capteur plein format
const DIAGONAL_FF = Math.sqrt(36 * 36 + 24 * 24);

// Focale de référence pour le zoom (grand-angle standard)
const REFERENCE_FOCAL = 24;

function App() {
  const [focalLength, setFocalLength] = useState(50);
  const [sensorKey, setSensorKey] = useState("Plein format (35mm)");

  const sensor = SENSORS[sensorKey];
  const cropFactor = sensor.cropFactor;

  // Équivalent plein format
  const equivalentFocalLength = Math.round(focalLength * cropFactor);

  // Angle de champ (diagonal) en degrés
  const angleOfView = useMemo(() => {
    const diagonal = Math.sqrt(sensor.width ** 2 + sensor.height ** 2);
    return 2 * Math.atan(diagonal / (2 * focalLength)) * (180 / Math.PI);
  }, [focalLength, sensor]);

  // Angle de champ équivalent FF (pour comparaison)
  const angleOfViewFF = useMemo(() => {
    return 2 * Math.atan(DIAGONAL_FF / (2 * equivalentFocalLength)) * (180 / Math.PI);
  }, [equivalentFocalLength]);

  // Calcul du zoom basé sur l'équivalent plein format
  // 24mm FF = zoom 1x (référence grand-angle)
  const zoomScale = useMemo(() => {
    const scale = equivalentFocalLength / REFERENCE_FOCAL;
    // Limiter le zoom max pour rester visuellement lisible
    return Math.min(scale, 8);
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
    const minLog = Math.log(8);
    const maxLog = Math.log(600);
    return ((Math.log(f) - minLog) / (maxLog - minLog)) * 100;
  };

  const sliderToFocal = (s: number) => {
    const minLog = Math.log(8);
    const maxLog = Math.log(600);
    return Math.round(Math.exp(minLog + (s / 100) * (maxLog - minLog)));
  };

  return (
    <Box>
      <Flex gap={6} direction={{ base: "column", lg: "row" }}>
        {/* Colonne gauche : Visualisations */}
        <Box flex="1">
          {/* Photo avec zoom selon focale */}
          <Box 
            position="relative" 
            borderRadius="lg" 
            overflow="hidden" 
            boxShadow="lg" 
            mb={4}
            height="300px"
          >
            <Box
              width="100%"
              height="100%"
              overflow="hidden"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Box
                as="img"
                src={SAMPLE_IMAGE}
                alt="Paysage exemple"
                minWidth="100%"
                minHeight="100%"
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
              
              {/* Angle plein format (référence, gris clair) */}
              {cropFactor > 1 && (
                <path
                  d={`M 20 60 L ${20 + 260 * Math.cos((-angleOfViewFF / 2) * Math.PI / 180)} ${60 - 260 * Math.sin((angleOfViewFF / 2) * Math.PI / 180)} L ${20 + 260 * Math.cos((angleOfViewFF / 2) * Math.PI / 180)} ${60 + 260 * Math.sin((angleOfViewFF / 2) * Math.PI / 180)} Z`}
                  fill="#EFF7FB"
                  stroke="#ccc"
                  strokeWidth="1"
                />
              )}
              
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

            {cropFactor > 1 && (
              <Text fontSize="xs" color="#888" mt={2} textAlign="center">
                Zone grise = angle équivalent plein format ({angleOfViewFF.toFixed(1)}°)
              </Text>
            )}
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
              <Box px={2} pt={2} pb={6}>
                <Slider
                  value={focalToSlider(focalLength)}
                  onChange={(val) => setFocalLength(sliderToFocal(val))}
                  min={0}
                  max={100}
                  step={0.5}
                >
                  {[8, 14, 24, 35, 50, 85, 135, 200, 400].map((f) => (
                    <SliderMark key={f} value={focalToSlider(f)} {...labelStyles}>
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
                Équivalences pour ce capteur
              </Text>
              <Flex wrap="wrap" gap={2}>
                {[14, 24, 35, 50, 85, 135].map((f) => (
                  <Box
                    key={f}
                    bg={f === focalLength ? "#FB9936" : "#EFF7FB"}
                    color={f === focalLength ? "white" : "#212E40"}
                    px={3}
                    py={1}
                    borderRadius="md"
                    fontSize="xs"
                    cursor="pointer"
                    onClick={() => setFocalLength(f)}
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
