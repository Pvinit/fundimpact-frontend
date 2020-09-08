import "./index.css";

import React from "react";
import ReactDOM from "react-dom";

import App from "./App";
import { UIProvider } from "./contexts/uiContext";
import { UserProvider } from "./contexts/userContext";
import * as serviceWorker from "./serviceWorker";

function loadLocaleData(locale: string) {
	switch (
		locale
		// case 'fr':
		//   return import('compiled-lang/fr.json')
		// default:
		//   return import('compiled-lang/en.json')
	) {
	}
}

(function () {
	const locale = navigator.languages[0] || navigator.language;
	ReactDOM.render(
		<UIProvider>
			<UserProvider>
				<App />
			</UserProvider>
		</UIProvider>,
		document.getElementById("root")
	);
})();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
