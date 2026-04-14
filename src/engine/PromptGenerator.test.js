/**
 * PromptGenerator tests — valida os prompts por formato e o gerador full pack.
 */
import { describe, it, expect } from 'vitest';
import { PromptGenerator } from './PromptGenerator.js';

const BASE = {
  name: 'Coral Rende Muito 18L',
  category: 'Tintas Acrílicas',
  catContext: {
    keywords: ['rendimento', 'cobertura'],
    visual_cue: 'parede branca recém-pintada em sala',
  },
};

describe('PromptGenerator.generate()', () => {
  it('retorna os 4 prompts básicos + format_spec para reels', () => {
    const result = PromptGenerator.generate({ ...BASE, format: 'reels' });
    expect(result).toHaveProperty('studio');
    expect(result).toHaveProperty('lifestyle');
    expect(result).toHaveProperty('institutional');
    expect(result).toHaveProperty('mascote');
    expect(result).toHaveProperty('format_spec');
    expect(result.format_spec.aspect).toBe('9:16');
    expect(result.format_spec.resolution).toBe('1080x1920');
  });

  it('usa format_spec 1:1 para carrossel', () => {
    const result = PromptGenerator.generate({ ...BASE, format: 'carrossel' });
    expect(result.format_spec.aspect).toBe('1:1');
    expect(result.format_spec.resolution).toBe('1080x1080');
  });

  it('usa format_spec 3:1 para banner_site', () => {
    const result = PromptGenerator.generate({ ...BASE, format: 'banner_site' });
    expect(result.format_spec.aspect).toBe('3:1');
  });

  it('faz fallback para reels quando formato inválido', () => {
    const result = PromptGenerator.generate({ ...BASE, format: 'formato_inexistente' });
    expect(result.format_spec.aspect).toBe('9:16');
  });

  it('injeta nome do produto em todos os prompts básicos', () => {
    const result = PromptGenerator.generate({ ...BASE, format: 'reels' });
    expect(result.studio).toContain('Coral Rende Muito 18L');
    expect(result.mascote).toContain('Coral Rende Muito 18L');
  });

  it('inclui o mascote oficial no prompt mascote', () => {
    const result = PromptGenerator.generate({ ...BASE, format: 'reels' });
    expect(result.mascote).toContain('mascote');
    expect(result.mascote).toContain('Gama');
  });

  it('funciona sem catContext (usa fallbacks)', () => {
    const result = PromptGenerator.generate({
      name: 'Produto X',
      category: 'Cat Y',
      format: 'reels',
    });
    expect(result.studio).toContain('Produto X');
  });
});

describe('PromptGenerator.generateFull()', () => {
  it('gera pack completo para os 6 formatos', () => {
    const result = PromptGenerator.generateFull(BASE);
    expect(result).toHaveProperty('name', 'Coral Rende Muito 18L');
    expect(result).toHaveProperty('category', 'Tintas Acrílicas');
    expect(result).toHaveProperty('packs');
    expect(Object.keys(result.packs)).toEqual(
      expect.arrayContaining(['reels', 'carrossel', 'stories', 'post_estatico', 'banner_site', 'whatsapp'])
    );
  });

  it('cada pack tem os 6 tipos de prompts esperados', () => {
    const result = PromptGenerator.generateFull(BASE);
    const reelsPack = result.packs.reels;
    expect(reelsPack.prompts).toHaveProperty('studio');
    expect(reelsPack.prompts).toHaveProperty('lifestyle');
    expect(reelsPack.prompts).toHaveProperty('institutional');
    expect(reelsPack.prompts).toHaveProperty('mascote');
    expect(reelsPack.prompts).toHaveProperty('coral_product');
    expect(reelsPack.prompts).toHaveProperty('video');
  });

  it('cada prompt tem label e prompt_pt em português', () => {
    const result = PromptGenerator.generateFull(BASE);
    const studio = result.packs.carrossel.prompts.studio;
    expect(studio).toHaveProperty('label');
    expect(studio).toHaveProperty('prompt_pt');
    expect(studio.prompt_pt.length).toBeGreaterThan(50);
  });

  it('inclui timestamp generatedAt', () => {
    const before = Date.now();
    const result = PromptGenerator.generateFull(BASE);
    expect(result.generatedAt).toBeGreaterThanOrEqual(before);
  });

  it('preserva keywords do catContext', () => {
    const result = PromptGenerator.generateFull(BASE);
    expect(result.keywords).toEqual(['rendimento', 'cobertura']);
  });
});
