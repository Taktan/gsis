# Получение квадратного изображения со спутника

## Описание проекта

Приложение, построенное на основе архитектурного стиля [REST API](https://ru.wikipedia.org/wiki/REST), позволяет получить квадратные снимки со спутника, используя платформу [Google Earth Engine](https://earthengine.google.com/)

### Используемые технолгии:

- [VueJs](https://vuejs.org/) - JavaScript фреймворк для реализации интерфейса
- [Vuetify](https://vuetifyjs.com/en/) - библиотека пользовательского интерфейса Vue в стиле Material Design
- [Vue Zoomer](https://www.npmjs.com/package/vue-zoomer) - копмпонент для VueJs, позволяющий интерактивно масштабировать изображение
- [NodeJs](https://nodejs.org/en/) - программное обеспечение для запуска HTTP-сервера на JavaScript
- [ExpressJs](https://expressjs.com/ru/) - фреймворк для создания веб-приложений и API
- [Google Earth Engine](https://earthengine.google.com/) - платформа для работы с космосъемкой
- [Axios](https://github.com/axios/axios) - HTTP-клиент на основе Promise
- [JSZip](https://stuk.github.io/jszip/) - библиотека JavaScript для работы с zip-архивами
- [Sharp](https://sharp.pixelplumbing.com/) - модуль для NodeJs позволяющий работать с изображениями
- [Tiff.js](https://github.com/seikichi/tiff.js/tree/master) - скрипт для обработки изображений в формате .tif(.tiff)

## Запуск

Предварительно нужно [создать сервисный аккаунт](https://developers.google.com/earth-engine/guides/service_account) и [подать заявку на его регистрацию](https://signup.earthengine.google.com/#!/service_accounts). Полученный ключ формата JSON нужно переименовать в *private.json* и переместить в корень данного проекта.

Далее нужно выполнить команду установки пакетов