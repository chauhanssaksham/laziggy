import type { I18nKey } from "./en";

export const ja: Record<I18nKey, string> = {
	// Tabs
	"tab.browse": "メニュー",
	"tab.chat": "チャット",

	// MenuBottomBar
	"input.placeholder": "今日は何が食べたい？",
	"input.disabled": "チャット回数の上限に達しました",

	// CartSheet
	"cart.title": "カート",
	"cart.empty": "カートは空です",
	"cart.emptyDesc":
		"メニューを見て、気になる料理を追加してください。",
	"cart.readyToOrder": "注文済み",
	"cart.showToWaiter": "スタッフにお見せし、完了したら押してください",
	"cart.ordered": "注文済み",

	// BrowseView
	"browse.noItems": "フィルターに一致するメニューがありません。",
	"browse.clearFilters": "フィルターをクリア",

	// ChatView
	"chat.error": "エラーが発生しました。もう一度お試しください。",

	// FilterBar — diets
	"diet.veg": "ベジ",
	"diet.non-veg": "ノンベジ",
	"diet.egg": "卵あり",

	// FilterBar — allergens
	"allergen.no.dairy": "乳製品なし",
	"allergen.no.nuts": "ナッツなし",
	"allergen.no.gluten": "グルテンなし",
	"allergen.no.eggs": "卵なし",
	"allergen.no.soy": "大豆なし",
	"allergen.no.seafood": "シーフードなし",
	"allergen.no.shellfish": "貝類なし",
	"allergen.no.seeds": "種子なし",
	"allergen.no.alcohol": "アルコールなし",

	// AllergenIcons (item-level labels)
	"allergen.dairy": "乳製品",
	"allergen.nuts": "ナッツ",
	"allergen.gluten": "グルテン",
	"allergen.eggs": "卵",
	"allergen.soy": "大豆",
	"allergen.seafood": "シーフード",
	"allergen.shellfish": "貝類",
	"allergen.seeds": "種子",
	"allergen.alcohol": "アルコール",

	// QuantityButton
	"qty.add": "追加",

	// ItemBadges
	"badge.popular": "人気",
	"badge.new": "新着",

	// Customizations
	"item.customizable": "カスタマイズ可能",
	"customization.addItem": "追加",
	"customization.required": "必須",
	"customization.optional": "任意",
	"customization.included": "含まれています",
	"customization.select": "選択してください",
	"customization.selectOne": "必須 · 1つ選択",
	"customization.selectN": "必須 · 選択",
	"customization.selectRange": "必須 ·",
	"customization.optionalUpTo": "任意 · 最大",
	"customization.maxReached": "上限に達しました — 1つ解除すると変更できます",
	"customization.customizeAgain": "再カスタマイズ",
	"customization.addAnother": "もう1つ追加",
	"customization.yourPicks": "あなたの選択",
	"customization.default": "デフォルト",
	"customization.addNew": "新しいカスタマイズを追加",
};
