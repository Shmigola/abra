import { defineConfig } from "vite";
import { resolve } from "path";
import path from "path";
import fs from "fs";
import * as sass from "sass";
// import tailwindcss from "@tailwindcss/vite";
import handlebars from "vite-plugin-handlebars";
import events from "./src/public/js/api/events";
import eventsltr from "./src/public/js/api/events-ltr";
import eventlist from "./src/public/js/api/event-content-list";
import team from "./src/public/js/api/team";


function getHtmlEntryFiles(srcDir) {
	const entry = {};

	function traverseDir(currentDir) {
		const files = fs.readdirSync(currentDir);

		files.forEach((file) => {
			const filePath = path.join(currentDir, file);
			const isDirectory = fs.statSync(filePath).isDirectory();

			if (isDirectory) {
				// If it's a directory, recursively traverse it
				traverseDir(filePath);
			} else if (path.extname(file) === ".html") {
				// If it's an HTML file, add it to the entry object
				const name = path.relative(srcDir, filePath).replace(/\..*$/, "");
				entry[name] = filePath;
			}
		});
	}

	traverseDir(srcDir);

	return entry;
}

function transformImagePaths(isProduction) {
	return {
		name: "transform-image-paths",
		transformIndexHtml(html) {
			if (!isProduction) return html;

			return html.replace(/(href)="(?:\.\/)?(img\/[^"]+\.(?:webp|png|jpg|jpeg|gif|svg|ico))"/g, '$1="./assets/$2"');
		},
	};
}

// при збірці прибирає crossorigin
// const noAttr = () => {
// 	return {
// 		name: "no-attribute",
// 		transformIndexHtml(html) {
// 			return html.replace(`crossorigin`, "");
// 		},
// 	};
// };

// Плагін для видалення папки partials після збірки
function removePartialsPlugin() {
	return {
		name: "remove-partials-plugin",
		closeBundle: {
			sequential: true,
			order: "post",
			handler() {
				const partialsDir = path.resolve(__dirname, "dist/partials");
				if (fs.existsSync(partialsDir)) {
					console.log("Видаляємо папку partials з dist...");
					fs.rmSync(partialsDir, { recursive: true, force: true });
					console.log("Папку partials успішно видалено!");
				}
			},
		},
	};
}

export default defineConfig({
	root: "src",
	base: "./",
	build: {
		css: {
			preprocessorOptions: {
				scss: {
					implementation: sass,
					api: "modern-compiler",
				},
			},
		},
		rollupOptions: {
			input: getHtmlEntryFiles("src"),
			output: {
				// assetFileNames: (assetInfo) => {
				// 	if (/\.css$/.test(assetInfo.name)) {
				// 		return `assets/css/styles.css`;
				// 	}

				// 	if (/\.png$|\.jpe?g$|\.gif$|\.webp$|\.ico$/.test(assetInfo.name)) {
				// 		return "assets/img/[name][extname]";
				// 	}
				// 	if (/\.svg$/.test(assetInfo.name)) {
				// 		return "assets/img/svg/[name][extname]";
				// 	}

				// 	if (/\.js$/.test(assetInfo.name)) {
				// 		return `assets/js/[name][extname]`;
				// 	}

				// 	if (/woff|woff2|ttf/.test(assetInfo.name)) {
				// 		return `assets/fonts/[name][extname]`;
				// 	}
				// 	return "assets/[name][extname]";
				// },

				assetFileNames: (assetInfo) => {
					if (/\.css$/.test(assetInfo.name)) {
						return `css/styles.min.css`;
					} else {
						return assetInfo.originalFileName ?? assetInfo.name;
					}
				},

				entryFileNames: `js/[name].min.js`,
				chunkFileNames: `js/[name].min.js`,
			},
		},
		outDir: "../dist",
		emptyOutDir: true,
	},
	server: {
		port: 3000, // Порт локального сервера
		open: true, // Відкривати браузер при запуску
		host: true,
	},
	optimizeDeps: {
		entries: "src/**/*{.html,.css,.scss,.js}",
	},

	plugins: [
		// tailwindcss(),
		// noAttr(),
		// transformImagePaths(process.env.NODE_ENV === "production"),
		handlebars({
			partialDirectory: resolve("src", "partials"),
			reloadOnPartialChange: true,

			context: { events, eventsltr, eventlist, team },

			// щоб декілька - імпортуємо json файл і через кому додаємо
			// context: { images, data }
		}),
		{
			// перезавантажуємо сервер після змін у partials
			handleHotUpdate({ file, server }) {
				if (file.includes("src/partials") && file.endsWith(".html")) {
					server.ws.send({
						type: "full-reload",
						path: "*",
					});
				}
			},
		},
		// Додаємо плагін для видалення папки partials після збірки
		removePartialsPlugin(),
	],
});
