/** English strings — source of truth for all i18n keys. */
export const en = {
	// Tabs
	"tab.browse": "Browse",
	"tab.chat": "Chat",

	// MenuBottomBar
	"input.placeholder": "What are you in the mood for?",
	"input.disabled": "Chat limit reached",

	// CartSheet
	"cart.title": "Your Cart",
	"cart.empty": "Your cart is empty",
	"cart.emptyDesc": "Browse the menu and add items to get started.",
	"cart.readyToOrder": "Order Placed",
	"cart.showToWaiter": "Show your waiter, then tap when done",
	"cart.ordered": "Already Ordered",

	// BrowseView
	"browse.noItems": "No items match your filters.",
	"browse.clearFilters": "Clear filters",

	// ChatView
	"chat.error": "Something went wrong. Please try again.",

	// FilterBar — diets
	"diet.veg": "Veg",
	"diet.non-veg": "Non-Veg",
	"diet.egg": "Egg",

	// FilterBar — allergens
	"allergen.no.dairy": "No Dairy",
	"allergen.no.nuts": "No Nuts",
	"allergen.no.gluten": "No Gluten",
	"allergen.no.eggs": "No Eggs",
	"allergen.no.soy": "No Soy",
	"allergen.no.seafood": "No Seafood",
	"allergen.no.shellfish": "No Shellfish",
	"allergen.no.seeds": "No Seeds",
	"allergen.no.alcohol": "No Alcohol",

	// AllergenIcons (item-level labels)
	"allergen.dairy": "Dairy",
	"allergen.nuts": "Nuts",
	"allergen.gluten": "Gluten",
	"allergen.eggs": "Eggs",
	"allergen.soy": "Soy",
	"allergen.seafood": "Seafood",
	"allergen.shellfish": "Shellfish",
	"allergen.seeds": "Seeds",
	"allergen.alcohol": "Alcohol",

	// QuantityButton
	"qty.add": "Add",

	// ItemBadges
	"badge.popular": "Popular",
	"badge.new": "New",

	// Customizations
	"item.customizable": "Customizable",
	"customization.addItem": "Add Item",
	"customization.required": "Required",
	"customization.optional": "Optional",
	"customization.included": "Included",
	"customization.select": "Select",
	"customization.selectOne": "Required · Select 1",
	"customization.selectN": "Required · Select",
	"customization.selectRange": "Required ·",
	"customization.optionalUpTo": "Optional · up to",
	"customization.maxReached": "Maximum reached — deselect one to change",
	"customization.customizeAgain": "Customize again",
	"customization.addAnother": "Add another",
	"customization.yourPicks": "Your picks",
	"customization.default": "Default",
	"customization.addNew": "Add new customization",
} as const;

/** Union of all valid i18n string keys. */
export type I18nKey = keyof typeof en;
