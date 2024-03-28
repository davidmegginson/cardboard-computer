The Cardboard Computer
======================

Cut-out templates, information, and exercises for making a paper or cardboard circular sliderule that can do multiplication, division, cube/square roots, circle problems, 3-stage multiplication, and ratios/conversions (likes kilometers to miles).

Web site: https://cardboard-computer.org

User guide: https://cardboard-computer.org/guide.html

Cut-out templates: https://cardboard-computer.org/templates.html


## Embedding in your own web pages

(Note: you will also need to copy some style rules from docs/style.css — I'll fix that later.)

The main code is in docs/modules/cardboard-computer.js

To build a new circular sliderule (CardboardComputer), create an element like this in your HTML:

```
<figure id="sliderule"></figure>
```

Then include the CardBoardComputer like this

```
<script type="text/javascript" defer="defer">
import("./modules/cardboard-computer.js").then((cc) => {
    new cc.CardboardComputer("sliderule", { advanced: false });
});
</script>
```

To use the advanced version, change the ``advanced`` option from ``false`` to ``true``.

To add an interactive demo, create a second element in your HTML, like this:

```
<figure id="demo"></figure>
```

and change your import to

```
<script type="text/javascript" defer="defer">
import("./modules/cardboard-computer.js").then((cc) => {
    new cc.CardboardComputer("sliderule", { advanced: false }).activateDemo("demo");
});
</script>
```

## Author

Created by David Megginson, starting in March 2024.

## License

The CardboardComputer is released into the Public Domain, and comes with NO WARRANTY. See [UNLICENCE.md](./UNLICENCE.md) for details.
