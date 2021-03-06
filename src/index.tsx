import "./index.css";

import React from "react";
import ReactDOM from "react-dom";
import { IntlProvider } from "react-intl";

import App from "./App";
import { UIProvider } from "./contexts/uiContext";
import { UserProvider } from "./contexts/userContext";
import * as serviceWorker from "./serviceWorker";
import { DashboardProvider } from "./contexts/dashboardContext";

function loadLocaleData(locale: string) {
	const defaultLocal = import(`../src/compiled-lang/en.json`);
	if (!locale) return defaultLocal;
	switch (locale) {
		case "hi":
			return import(`../src/compiled-lang/hi.json`);
		default:
			return defaultLocal;
	}

	/**
	 * @description The code below seems smaller than the one above for loading different
	 * the language's file, but we are still not using it because, in the apporach mention below,
	 * we cannot get types on the compiled lang.
	 */
	// try {
	// 	return import(`../src/compiled-lang/${locale}.json`);
	// } catch (error) {
	// 	console.error(
	// 		`Failed to fetch lang data for locale: ${locale}. Switching to default locale`
	// 	);
	// 	return defaultLocal;
	// }
}

(async function () {
	const locale = navigator.languages[0] || navigator.language;
	const messages = await loadLocaleData(locale);
	ReactDOM.render(
		<IntlProvider messages={messages.default} locale={locale} defaultLocale="en">
			<UserProvider>
				<DashboardProvider>
					<UIProvider>
						<App />
					</UIProvider>
				</DashboardProvider>
			</UserProvider>
		</IntlProvider>,
		document.getElementById("root")
	);
})();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
