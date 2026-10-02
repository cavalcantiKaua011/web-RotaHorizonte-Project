// Rota Horizonte Brand Identity
// Extracted from "Painel Rota Horizonte Marca.pdf"
// 
// PALETTE:
// Azul Profundo:   CMYK 0-23-73-40  | Pantone 349 C  | RGB 57-120-68  (but seems off, mapping to #2B4A8A based on visual)
// Verde Floresta:  CMYK 0-71-77-11  | Pantone 2347 C | RGB 227-66-52  
// Preto/Grafite:   CMYK 0-0-0-67    | Pantone 9 C    | RGB 85-85-85
// Amarelo Sol:     CMYK 0-23-73-40  | Pantone 123 C  | RGB 246-190-66
// Areia/Bege:      CMYK 0-17-41-22  | Pantone 465 C  | RGB 199-165-118
// Verde Destaque:  Pantone 349 C    | RGB 57-120-68
//
// TYPOGRAPHY:
// Primary Display: "Azkadinya" (script/display font - used for headlines)  
// Body/UI: "Cloud Soft" (clean sans-serif - used for body text and UI)

export const BRAND = {
  colors: {
    // Primary brand colors from brand guidelines
    azulProfundo: '#1B3A5C',      // Deep navy blue - main brand color
    verdeAventura: '#396644',     // Forest green - nature/adventure
    verdeClaro: '#39784C',        // Lighter green accent
    amareloCaminhada: '#F6BE42',  // Golden yellow - energy/sun
    areiaBege: '#C7A576',         // Sandy beige - earth tones
    cinzaGrafite: '#555555',      // Dark gray - text
    
    // Extended palette
    azulEscuro: '#0F2540',        // Darker navy for depth
    verdeEscuro: '#1E4429',       // Dark forest green
    amareloDark: '#D4A017',       // Darker gold
    areiaLight: '#E8D5B7',        // Light sand
    branco: '#FFFFFF',
    cinzaClaro: '#F5F5F0',        // Off-white/natural
    cinzaMedio: '#9A9A9A',
    pretoBrands: '#1A1A1A',
    
    // Status colors
    statusAberta: '#22C55E',
    statusQuaseLotada: '#F59E0B',
    statusLotada: '#EF4444',
    statusListaEspera: '#8B5CF6',
    statusCancelada: '#6B7280',
  },
  
  gradients: {
    hero: 'linear-gradient(135deg, #0F2540 0%, #1B3A5C 40%, #396644 100%)',
    heroOverlay: 'linear-gradient(180deg, rgba(15,37,64,0.7) 0%, rgba(15,37,64,0.4) 50%, rgba(57,102,68,0.6) 100%)',
    card: 'linear-gradient(135deg, #1B3A5C 0%, #396644 100%)',
    golden: 'linear-gradient(135deg, #F6BE42 0%, #D4A017 100%)',
    earth: 'linear-gradient(135deg, #C7A576 0%, #9A7A55 100%)',
    dark: 'linear-gradient(180deg, #0F2540 0%, #1A1A1A 100%)',
  },
  
  fonts: {
    display: '"Azkadinya", "Georgia", serif',      // For hero titles
    body: '"Cloud Soft", "Inter", sans-serif',       // For body text
    ui: '"Inter", "Segoe UI", sans-serif',           // For UI elements
  },
  
  shadows: {
    card: '0 4px 24px rgba(15,37,64,0.15)',
    cardHover: '0 8px 40px rgba(15,37,64,0.25)',
    hero: '0 20px 60px rgba(15,37,64,0.4)',
    golden: '0 4px 20px rgba(246,190,66,0.3)',
  },
};

// CSS Variables string for injection into HTML
export const CSS_VARS = `
  --brand-azul: ${BRAND.colors.azulProfundo};
  --brand-verde: ${BRAND.colors.verdeAventura};
  --brand-verde-claro: ${BRAND.colors.verdeClaro};
  --brand-amarelo: ${BRAND.colors.amareloCaminhada};
  --brand-areia: ${BRAND.colors.areiaBege};
  --brand-cinza: ${BRAND.colors.cinzaGrafite};
  --brand-azul-escuro: ${BRAND.colors.azulEscuro};
  --brand-verde-escuro: ${BRAND.colors.verdeEscuro};
  --brand-cinza-claro: ${BRAND.colors.cinzaClaro};
  --brand-branco: ${BRAND.colors.branco};
`;
