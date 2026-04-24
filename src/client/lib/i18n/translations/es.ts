import type { I18nKey } from "./en";

export const es: Record<I18nKey, string> = {
	// Tabs
	"tab.browse": "Explorar",
	"tab.chat": "Chat",

	// MenuBottomBar
	"input.placeholder": "¿Qué te apetece?",
	"input.disabled": "Límite de chat alcanzado",

	// CartSheet
	"cart.title": "Tu carrito",
	"cart.empty": "Tu carrito está vacío",
	"cart.emptyDesc":
		"Explora el menú y agrega artículos para comenzar.",
	"cart.readyToOrder": "Pedido realizado",
	"cart.showToWaiter": "Muestra al mesero y toca cuando termines",
	"cart.ordered": "Ya pedido",

	// BrowseView
	"browse.noItems": "Ningún artículo coincide con tus filtros.",
	"browse.clearFilters": "Borrar filtros",

	// ChatView
	"chat.error": "Algo salió mal. Por favor, inténtalo de nuevo.",

	// FilterBar — diets
	"diet.veg": "Vegetariano",
	"diet.non-veg": "No Vegetariano",
	"diet.egg": "Con Huevo",

	// FilterBar — allergens
	"allergen.no.dairy": "Sin Lácteos",
	"allergen.no.nuts": "Sin Frutos secos",
	"allergen.no.gluten": "Sin Gluten",
	"allergen.no.eggs": "Sin Huevo",
	"allergen.no.soy": "Sin Soja",
	"allergen.no.seafood": "Sin Mariscos",
	"allergen.no.shellfish": "Sin Crustáceos",
	"allergen.no.seeds": "Sin Semillas",
	"allergen.no.alcohol": "Sin Alcohol",

	// AllergenIcons (item-level labels)
	"allergen.dairy": "Lácteos",
	"allergen.nuts": "Frutos secos",
	"allergen.gluten": "Gluten",
	"allergen.eggs": "Huevo",
	"allergen.soy": "Soja",
	"allergen.seafood": "Mariscos",
	"allergen.shellfish": "Crustáceos",
	"allergen.seeds": "Semillas",
	"allergen.alcohol": "Alcohol",

	// QuantityButton
	"qty.add": "Agregar",

	// ItemBadges
	"badge.popular": "Popular",
	"badge.new": "Nuevo",

	// Customizations
	"item.customizable": "Personalizable",
	"customization.addItem": "Agregar",
	"customization.required": "Obligatorio",
	"customization.optional": "Opcional",
	"customization.included": "Incluido",
	"customization.select": "Selecciona",
	"customization.selectOne": "Obligatorio · Selecciona 1",
	"customization.selectN": "Obligatorio · Selecciona",
	"customization.selectRange": "Obligatorio ·",
	"customization.optionalUpTo": "Opcional · hasta",
	"customization.maxReached": "Máximo alcanzado — deselecciona uno para cambiar",
	"customization.customizeAgain": "Personalizar de nuevo",
	"customization.addAnother": "Agregar otro",
	"customization.yourPicks": "Tus opciones",
	"customization.default": "Predeterminado",
	"customization.addNew": "Agregar nueva personalización",
};
