"""
gama_scraper.py — Scraping de contexto do gamatintas.com.br
Extrai: identidade visual, logos, marcas, categorias, produtos.
SEM preços. Funciona no Termux e no Windows.

Uso:
  pip install requests beautifulsoup4 lxml
  python gama_scraper.py
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import os
import re
from urllib.parse import urljoin, urlparse

BASE_URL = "https://www.gamatintas.com.br"
OUTPUT_FILE = "gama_context.json"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "pt-BR,pt;q=0.9",
}

session = requests.Session()
session.headers.update(HEADERS)


# ─── Helpers ──────────────────────────────────────────────────────────────────

def get(url, retries=3):
    for i in range(retries):
        try:
            r = session.get(url, timeout=15)
            r.raise_for_status()
            return r
        except Exception as e:
            print(f"  ⚠ Tentativa {i+1} falhou: {e}")
            time.sleep(2)
    return None


def soup(url):
    r = get(url)
    if not r:
        return None
    return BeautifulSoup(r.text, "lxml")


def clean(text):
    return " ".join(text.strip().split()) if text else ""


# ─── 1. Identidade Visual ──────────────────────────────────────────────────────

def scrape_identity(page):
    print("📐 Extraindo identidade visual...")
    result = {"logos": [], "cores": [], "fontes": [], "favicon": ""}

    # Favicon
    favicon = page.find("link", rel=lambda r: r and "icon" in r)
    if favicon:
        result["favicon"] = urljoin(BASE_URL, favicon.get("href", ""))

    # Logos (imagens com "logo" no src ou alt)
    for img in page.find_all("img"):
        src = img.get("src", "") or img.get("data-src", "")
        alt = img.get("alt", "")
        if any(k in (src + alt).lower() for k in ["logo", "marca", "gama"]):
            full_url = urljoin(BASE_URL, src)
            if full_url not in result["logos"]:
                result["logos"].append(full_url)

    # Cores via CSS inline e style tags
    style_tags = page.find_all("style")
    hex_colors = set()
    for tag in style_tags:
        found = re.findall(r'#([0-9a-fA-F]{3,6})\b', tag.string or "")
        hex_colors.update(["#" + c for c in found if len(c) in (3, 6)])
    result["cores"] = list(hex_colors)[:20]

    return result


# ─── 2. Marcas ─────────────────────────────────────────────────────────────────

def scrape_brands(page):
    print("🏷️  Extraindo marcas...")
    brands = []

    # Procura links ou textos que mencionam marcas
    for el in page.find_all(["a", "span", "li", "div"]):
        text = clean(el.get_text())
        # Marcas conhecidas da Gama
        known = ["CORAL", "SPARLACK", "TIGRE", "HENKEL", "TRAMONTINA",
                 "NORTON", "VIAPOL", "WANDA", "COLORGIN", "BASTON",
                 "AKZO", "TINTING", "MACTRA"]
        for brand in known:
            if brand in text.upper() and brand not in brands:
                brands.append(brand)

    # Também pega da URL /m/000001/nomemarca
    r = get(BASE_URL)
    if r:
        brand_matches = re.findall(r'/m/\d+/([a-z0-9\-]+)', r.text)
        for b in brand_matches:
            name = b.upper().replace("-", " ")
            if name not in brands:
                brands.append(name)

    return list(set(brands))


# ─── 3. Categorias ─────────────────────────────────────────────────────────────

def scrape_categories(page):
    print("📦 Extraindo categorias...")
    categories = []

    # Menu de navegação geralmente tem as categorias
    nav = page.find("nav") or page.find("ul", class_=re.compile("menu|nav|categ", re.I))
    if nav:
        for a in nav.find_all("a"):
            text = clean(a.get_text())
            href = a.get("href", "")
            if text and len(text) > 2 and text not in ["Home", "Início", ""]:
                categories.append({"nome": text, "url": urljoin(BASE_URL, href)})

    # Fallback: links com padrão de categoria
    if not categories:
        for a in page.find_all("a", href=True):
            href = a["href"]
            text = clean(a.get_text())
            if (
                href.startswith("/") and
                text and len(text) > 2 and
                not any(k in href for k in ["login", "cart", "conta", "busca"]) and
                "/" in href[1:]  # tem pelo menos um nível
            ):
                entry = {"nome": text, "url": urljoin(BASE_URL, href)}
                if entry not in categories:
                    categories.append(entry)

    return categories[:30]  # limita pra não poluir


# ─── 4. Produtos por categoria ─────────────────────────────────────────────────

CATEGORY_URLS = [
    "/coral",
    "/tintas--vernizes--complementos",
    "/tintas--vernizes--complementos/acrilica-economica",
    "/tintas--vernizes--complementos/acrilica-premium",
    "/tintas--vernizes--complementos/esmalte-premium",
    "/tintas--vernizes--complementos/vernizes",
    "/tintas--vernizes--complementos/texturas",
    "/standart/coralar-duo",
    "/standart/rende-muito-loc",
    "/standart/pinta-piso",
    "/standart/sol-chuva-rm",
    "/standart/sparlack-verniz",
    "/standart/decora-rm",
]

def scrape_products_from_page(url):
    products = []
    page = soup(url)
    if not page:
        return products

    # Produtos geralmente têm classe com "product" ou "item"
    cards = page.find_all(class_=re.compile("product|item|card", re.I))
    if not cards:
        # Fallback: procura padrão de nome de produto
        cards = page.find_all(["li", "div"], attrs={"data-product": True})

    for card in cards[:30]:
        text = clean(card.get_text())
        img = card.find("img")
        img_url = ""
        if img:
            img_url = urljoin(BASE_URL, img.get("src") or img.get("data-src") or "")

        # Ignora textos muito curtos ou sem conteúdo útil
        if len(text) > 3 and not text.isdigit():
            # Extrai código se existir
            code_match = re.search(r'[Cc]ódigo[:\s]+(\w+)', text)
            emb_match = re.search(r'[Ee]mbalagem[:\s]+([\d,\.]+\s*[LlKkGg]+)', text)

            products.append({
                "nome": text[:120],
                "imagem": img_url,
                "codigo": code_match.group(1) if code_match else "",
                "embalagem": emb_match.group(1) if emb_match else "",
                "url": url,
            })

    return products


def scrape_all_products():
    print("🛒 Extraindo produtos (sem preços)...")
    all_products = {}

    for path in CATEGORY_URLS:
        url = BASE_URL + path
        cat_name = path.split("/")[-1].replace("-", " ").upper()
        print(f"  → {cat_name}")
        products = scrape_products_from_page(url)
        if products:
            all_products[cat_name] = products
        time.sleep(1)  # respeita o servidor

    return all_products


# ─── 5. Informações gerais do site ─────────────────────────────────────────────

def scrape_general_info(page):
    print("ℹ️  Extraindo informações gerais...")
    info = {}

    # Título
    title = page.find("title")
    info["titulo"] = clean(title.get_text()) if title else ""

    # Meta description
    meta_desc = page.find("meta", attrs={"name": "description"})
    info["descricao"] = meta_desc.get("content", "") if meta_desc else ""

    # Telefone / WhatsApp
    phones = re.findall(r'[\(\d][\d\s\-\(\)]{8,}[\d]', page.get_text())
    info["contatos"] = list(set(phones[:5]))

    # Endereço
    address_el = page.find(class_=re.compile("address|endereco|footer", re.I))
    info["endereco"] = clean(address_el.get_text())[:200] if address_el else ""

    # Links sociais
    socials = []
    for a in page.find_all("a", href=True):
        href = a["href"]
        if any(s in href for s in ["instagram", "facebook", "youtube", "linkedin", "whatsapp"]):
            socials.append(href)
    info["redes_sociais"] = list(set(socials))

    return info


# ─── MAIN ──────────────────────────────────────────────────────────────────────

def main():
    print(f"\n🚀 Iniciando scraping de {BASE_URL}\n")

    homepage = soup(BASE_URL)
    if not homepage:
        print("❌ Não foi possível acessar o site. Verifique sua conexão.")
        return

    result = {
        "site": BASE_URL,
        "info_geral": scrape_general_info(homepage),
        "identidade_visual": scrape_identity(homepage),
        "marcas": scrape_brands(homepage),
        "categorias": scrape_categories(homepage),
        "produtos": scrape_all_products(),
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    # Resumo
    total_produtos = sum(len(v) for v in result["produtos"].values())
    print(f"""
✅ Scraping concluído!
─────────────────────
📁 Arquivo: {OUTPUT_FILE}
🏷️  Marcas encontradas: {len(result['marcas'])}
📦 Categorias: {len(result['categorias'])}
🛒 Produtos: {total_produtos}
🖼️  Logos: {len(result['identidade_visual']['logos'])}
""")


if __name__ == "__main__":
    main()
