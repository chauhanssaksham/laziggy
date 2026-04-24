import type { I18nKey } from "./en";

export const fr: Record<I18nKey, string> = {
	// Tabs
	"tab.browse": "Parcourir",
	"tab.chat": "Chat",

	// MenuBottomBar
	"input.placeholder": "Envie de quoi ?",
	"input.disabled": "Limite de chat atteinte",

	// CartSheet
	"cart.title": "Votre panier",
	"cart.empty": "Votre panier est vide",
	"cart.emptyDesc":
		"Parcourez le menu et ajoutez des articles pour commencer.",
	"cart.readyToOrder": "Commande passée",
	"cart.showToWaiter": "Montrez au serveur, puis appuyez quand c'est fait",
	"cart.ordered": "Déjà commandé",

	// BrowseView
	"browse.noItems": "Aucun article ne correspond à vos filtres.",
	"browse.clearFilters": "Effacer les filtres",

	// ChatView
	"chat.error": "Une erreur est survenue. Veuillez réessayer.",

	// FilterBar — diets
	"diet.veg": "Végé",
	"diet.non-veg": "Non-Végé",
	"diet.egg": "Œuf",

	// FilterBar — allergens
	"allergen.no.dairy": "Sans Lait",
	"allergen.no.nuts": "Sans Noix",
	"allergen.no.gluten": "Sans Gluten",
	"allergen.no.eggs": "Sans Œufs",
	"allergen.no.soy": "Sans Soja",
	"allergen.no.seafood": "Sans Fruits de mer",
	"allergen.no.shellfish": "Sans Crustacés",
	"allergen.no.seeds": "Sans Graines",
	"allergen.no.alcohol": "Sans Alcool",

	// AllergenIcons (item-level labels)
	"allergen.dairy": "Lait",
	"allergen.nuts": "Noix",
	"allergen.gluten": "Gluten",
	"allergen.eggs": "Œufs",
	"allergen.soy": "Soja",
	"allergen.seafood": "Fruits de mer",
	"allergen.shellfish": "Crustacés",
	"allergen.seeds": "Graines",
	"allergen.alcohol": "Alcool",

	// QuantityButton
	"qty.add": "Ajouter",

	// ItemBadges
	"badge.popular": "Populaire",
	"badge.new": "Nouveau",

	// Customizations
	"item.customizable": "Personnalisable",
	"customization.addItem": "Ajouter",
	"customization.required": "Obligatoire",
	"customization.optional": "Optionnel",
	"customization.included": "Inclus",
	"customization.select": "Sélectionnez",
	"customization.selectOne": "Obligatoire · Sélectionnez 1",
	"customization.selectN": "Obligatoire · Sélectionnez",
	"customization.selectRange": "Obligatoire ·",
	"customization.optionalUpTo": "Optionnel · jusqu'à",
	"customization.maxReached": "Maximum atteint — désélectionnez un pour changer",
	"customization.customizeAgain": "Personnaliser à nouveau",
	"customization.addAnother": "Ajouter un autre",
	"customization.yourPicks": "Vos choix",
	"customization.default": "Par défaut",
	"customization.addNew": "Ajouter une personnalisation",
};
