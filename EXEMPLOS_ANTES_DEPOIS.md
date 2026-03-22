# Exemplos Antes / Depois — Remoção de "Linha Completa" e "Mix Completo"

## Objetivo da mudança
Tom mais natural, honesto e acolhedor: parceiros confiáveis e acessíveis, não "o maior" ou "o único".

---

## 1. Reels / Legenda (Produto)

**ANTES:**
> 🎬 **DISCO FLAP 7"**
> 
> Precisa de Disco Flap 7" com urgência no ABC?
> 
> Linha completa de Disco Flap 7" na Labor.
> 
> Entrega ágil no ABC Paulista | Atendimento B2B

**DEPOIS:**
> 🎬 **DISCO FLAP 7"**
> 
> Precisa de Disco Flap 7" com urgência no ABC?
> 
> Temos opções de Disco Flap 7" que costumamos indicar.
> 
> Entrega ágil no ABC Paulista | Atendimento B2B

---

## 2. Reels / Legenda (Marca)

**ANTES:**
> 🏷️ **THOMPSON** na Labor Atacadista
> 
> Procurando Thompson? Na Labor tem linha completa.
> 
> Linha ampla e popular. Linha completa disponível no atacado.

**DEPOIS:**
> 🏷️ **THOMPSON** na Labor Atacadista
> 
> Procurando Thompson? Na Labor tem opções que atendem sua necessidade.
> 
> Linha ampla e popular. Opções que trabalhamos disponíveis no atacado.

---

## 3. Carrossel

**ANTES:**
> Entrega ágil no ABC Paulista | Atendimento B2B | Linha completa

**DEPOIS:**
> Entrega ágil no ABC Paulista | Atendimento B2B | Opções que atendem sua necessidade

---

## 4. Post Estático

**ANTES:**
> DISCO FLAP 7" disponível na Labor Atacadista. Atendimento B2B, linha completa e entrega ágil no ABC Paulista.

**DEPOIS:**
> DISCO FLAP 7" disponível na Labor Atacadista. Atendimento B2B, opções que trabalhamos e entrega ágil no ABC Paulista.

---

## 5. Banner Site

**ANTES:**
> Linha completa de ABRASIVOS | Entrega ágil no ABC Paulista

**DEPOIS:**
> Seleção de ABRASIVOS | Entrega ágil no ABC Paulista

---

## 6. WhatsApp B2B (Abertura)

**ANTES:**
> Olá! 👋
> 
> Aqui é da *Labor Atacadista*.
> 
> Trabalha com *THOMPSON*? Temos linha completa no atacado!

**DEPOIS:**
> Olá! 👋
> 
> Aqui é da *Labor Atacadista*.
> 
> Trabalha com *THOMPSON*? Temos opções que trabalhamos no atacado!

---

## 7. WhatsApp B2B (Proposta)

**ANTES:**
> ✅ Linha completa no atacado
> ✅ Entrega ágil no ABC Paulista

**DEPOIS:**
> ✅ Opções que trabalhamos no atacado
> ✅ Entrega ágil no ABC Paulista

---

## 8. Institucional (Tema Variedade)

**ANTES:**
> Pra que pingar em 10 fornecedores? A Labor tem o mix completo pra sua loja de bairro. Do parafuso ao acabamento premium.
> 
> CTA: Baixe nosso catálogo completo agora.

**DEPOIS:**
> Pra que pingar em 10 fornecedores? A Labor trabalha com marcas que entregam ótimo custo-benefício. Temos várias opções que podem se encaixar no que você precisa.
> 
> CTA: Me conta mais sobre o seu projeto? Vamos ver o que faz sentido pra você.

---

## 9. Roteiro Reels (Cena 2)

**ANTES:**
> Na Labor, DISCO FLAP com entrega ágil em todo o ABC Paulista. Linha completa, atendimento B2B.

**DEPOIS:**
> Na Labor, DISCO FLAP com entrega ágil em todo o ABC Paulista. Opções que atendem sua necessidade, atendimento B2B.

---

## 10. Ângulo Estratégico (Solução de Problema)

**ANTES:**
> Solução de Problema (mix completo, não faltar estoque)

**DEPOIS:**
> Solução de Problema (soluções que atendem bem essa necessidade)

---

## 11. Objetivo do Plano Semanal

**ANTES:**
> Mix Completo

**DEPOIS:**
> Variedade

---

## 12. ProductSelector (Institucional)

**ANTES:**
> Logística, parceria, mix completo

**DEPOIS:**
> Logística, parceria, variedade

---

## 13. Regras do Gemini (System Prompt)

**ANTES:**
> Use APENAS afirmações seguras: "entrega ágil no ABC", "linha completa", "atendimento B2B", "preço de atacado", "mix completo", "parceria que resolve".
> Foco nos diferenciais B2B: margem do lojista, giro rápido, parceria, logística ágil no ABC, linha completa.

**DEPOIS:**
> NUNCA use: "linha completa", "mix completo", "todo o mix", "portfólio completo", "todas as opções", "toda a linha", "todo o portfólio".
> Prefira: "alguns dos nossos principais produtos", "opções que temos disponíveis", "produtos que trabalhamos", "seleção de itens que oferecemos", "modelos que costumamos indicar", "soluções que atendem bem essa necessidade".
> Foco nos diferenciais B2B: margem do lojista, giro rápido, parceria, logística ágil no ABC, qualidade, atendimento próximo.

---

## Arquivos alterados

| Arquivo | Alterações |
|---------|------------|
| `src/providers/GeminiProvider.js` | System prompt, regras, ângulos, fallback de marca |
| `src/providers/LocalProvider.js` | Hooks, templates Reels, Carrossel, Post, Banner, WhatsApp |
| `src/providers/LLMProvider.js` | Regras do system prompt |
| `src/logic/marketing/BrandExpert.js` | Tema "Mix Completo" → "Variedade", body institucional |
| `src/logic/BrandBrain.js` | Foco do ângulo problem_solution |
| `src/logic/ContentTemplates.js` | Script de produto |
| `src/logic/BrandService.js` | STARFER, fallback getBrandContext |
| `src/engine/QualityChecker.js` | CREDIBILITY_KEYWORDS, BRAND_TONE_POSITIVE, hint |
| `src/components/ProductSelector.jsx` | Descrição institucional |
| `src/components/ContentGenerator.jsx` | Label do objetivo "Mix Completo" |
