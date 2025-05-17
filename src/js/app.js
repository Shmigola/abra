// import { useDynamicAdapt } from "./dynamicAdapt.js";
// useDynamicAdapt();

console.log("%cMade by FireMonster", "background:#8A2BE2;color:#fff;padding:4px 10px;font-weight:bold;border-radius:0.25rem;");

document.addEventListener("DOMContentLoaded", function () {
	const appHeight = () => {
		const doc = document.documentElement;
		doc.style.setProperty("--app-height", `${window.innerHeight}px`);
	};

	const menuBurgerBtn = document.querySelector(".header__menu");
	const menuBurger = document.querySelector(".menu__burger");
	const menuBurgerClose = document.querySelector(".menu__burger .menu-close");

	window.addEventListener("resize", appHeight);

	// menu open/close
	menuBurgerBtn &&
		menuBurgerBtn.addEventListener("click", () => {
			menuBurger.classList.add("active");
		});

	menuBurgerClose &&
		menuBurgerClose.addEventListener("click", () => {
			menuBurger.classList.remove("active");
		});

	menuBurgerBtn &&
		document.addEventListener("click", function (e) {
			if (!menuBurgerBtn.contains(e.target) && !menuBurger.contains(e.target)) {
				menuBurger.classList.remove("active");
			}
		});

	function initLanguageSwitcher() {
		const switcher = document.querySelector(".language__swither");
		const menu = document.querySelector(".language");
		const currentValue = document.querySelector(".language__current-value");
		const languageItems = document.querySelectorAll(".language__submenu-item a");

		switcher?.addEventListener("click", (e) => {
			e.stopPropagation();
			const expanded = switcher.getAttribute("aria-expanded") === "true";
			switcher.setAttribute("aria-expanded", !expanded);
			menu.classList.toggle("active");

			languageItems.forEach((item) => {
				item.setAttribute("tabindex", expanded ? "-1" : "0");
			});
		});

		languageItems.forEach((item) => {
			item.addEventListener("click", (e) => {
				e.preventDefault();
				const lang = item.getAttribute("lang");
				const flagSrc = item.querySelector("img").src;
				const languageName = item.getAttribute("data-language-name");
				const baseAriaLabel = item.getAttribute("data-base-aria-label"); // get from current lonk
				// Update current value
				currentValue.innerHTML = `<img src="${flagSrc}" aria-hidden="true" />`;
				currentValue.setAttribute("lang", lang);
				currentValue.setAttribute("xml:lang", lang);

				// update aria-label switcher
				switcher.setAttribute("aria-label", `${baseAriaLabel} ${languageName}`);

				// clode menu
				menu.classList.remove("active");
				switcher.setAttribute("aria-expanded", "false");

				// update state menu elements
				languageItems.forEach((i) => {
					i.setAttribute("aria-selected", i === item ? "true" : "false");
					i.setAttribute("tabindex", "-1");
				});
			});
		});

		document.addEventListener("click", (e) => {
			if (!menu.contains(e.target)) {
				menu.classList.remove("active");
				switcher?.setAttribute("aria-expanded", "false");
				languageItems.forEach((item) => item.setAttribute("tabindex", "-1"));
			}
		});
	}

	initLanguageSwitcher();

	appHeight();
});
