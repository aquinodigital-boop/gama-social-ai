
import { ContentTemplates } from './ContentTemplates.js';
import { BrandBrain } from './BrandBrain.js';

console.log("--- Testing Institutional/Category Input ---");

// Mock an Institutional Item (as passed from UI)
const mockInstitutionalItem = {
    name: "Marca Labor Atacadista",
    category: "Marca Labor Atacadista", // Adapter logic does this
    is_generic: true
};

const logisticsStrategy = BrandBrain.strategicAngles.find(s => s.id === 'logistics');

// Test Reels Generation for Institutional
const reelsInst = ContentTemplates.generateReelsScript(mockInstitutionalItem, logisticsStrategy);
console.log("Institutional Title:", reelsInst.title);
console.log("Visual Prompt 1:", reelsInst.assets.image_prompts[0]);

// Mock a Category Item
const mockCategoryItem = {
    name: "Ferramentas Elétricas",
    category: "Ferramentas Elétricas",
    is_generic: true
};

const reelsCat = ContentTemplates.generateReelsScript(mockCategoryItem, logisticsStrategy);
console.log("\nCategory Title:", reelsCat.title);
console.log("Visual Prompt 1:", reelsCat.assets.image_prompts[0]);

console.log("\n✅ Logic verified for non-product items.");
