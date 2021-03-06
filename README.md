# Браузерное расширение добавляющее немного удобства к FriendFeed-у

Возможности:

1. Заменяет креативные ники на скучные логины. Это, впрочем, отключается.
2. Заменяет иконки слева от комментов на ссылки, клик по которым добавляет в коммент `@login`. Ссылки также работают как пермалинки на коммент.
3. Открывает картинки в браузере, а не скачивает их на диск. В отличие от Golden View Friendfeed Image Zoom, ссылку на картинку можно давать и не обладателю расширения.
4. Позволяет отвечать на конкретные сообщения в ветках, ссылаясь на них через `^^^`.
5. Даёт возможность заменить «облачко» на юзерпик автора комментария.
6. Позволяет использовать переводы строк в постах и комментариях (вводятся через `Shift+Enter`, но видны будут только обладателям этого расширения).
7. …

## Установка в Chrome (Chromium, Opera, Yandex.Browser, …)

Страница плагина в Chrome Web Store: [тут](https://chrome.google.com/webstore/detail/friendfeed-co/cgniebblmblnalniphdgdjalefamejop)

## Установка в качестве userscript

Для запуска userscript-ов есть разные расширения к браузерам, например,
для Firefox можно использовать [Greasemonkey](https://addons.mozilla.org/ru/firefox/addon/greasemonkey/),
а для Safari - [Tampermonkey](http://tampermonkey.net/index.php?ext=dhdg&browser=safari).

После установки расширения, просто перейдите по [этой ссылке](https://github.com/davidmz/friendfeed-and-co/raw/master/ffco-sac.user.js) и браузер сам предложит вам сохранить userscript для дальнейшего использования.

Userscript обновляется автоматически, обновления проверяются один раз в сутки. Обновиться можно и вручную, для этого в настройках есть кнопка «Проверить обновления». Сам файл `ffco-sac.user.js` при этом обновлять не обязательно.

## Поддержка

Обсудить расширение можно в [этой ветке во FriendFeed-е](https://friendfeed.com/davidmz/db3867e6/src)
