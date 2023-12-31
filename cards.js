var cardsScript = document.currentScript;
!function (t, a) {
    "use strict";
    "function" == typeof define && define.amd ? define(["jquery"], a) : "object" == typeof exports ? module.exports = a(require("jquery")) : t.cards = a(t.jQuery)
}(this, function (t) {
    "use strict";

    function a(t, a) {
        var n, i;
        if (a) for (a = r.cardNames(a), t.empty(), n = 0; n < a.length; ++n) i = "src='" + r.options.imagesUrl + a[n] + ".svg'", t.append("<img class='card' " + i + ">")
    }

    function n(t, a) {
        var n, i, e, r, o, s = {};
        for (o = t.data(a), o = (o || "").replace(/\s/g, "").split(";"), i = 0, e = o.length; i < e; i++) r = o[i].split(":"), n = r[1], n && n.indexOf(",") >= 0 ? s[r[0]] = n.split(",") : s[r[0]] = Number(n) || n;
        return s
    }

    function i(a, n, i) {
        var r = a.length;
        if (0 !== r) {
            var o = i.width || a[0].clientWidth || 90, s = a[0].clientHeight || Math.floor(1.4 * o), h = {},
                c = e(r, i.radius, o, s, i.fanDirection, i.spacing, h), d = t(a[0]).parent();
            d.width(h.width), d.height(h.height);
            var f = 0;
            c.forEach(function (t) {
                var i = a[f++];
                i.style.left = t.x + "px", i.style.top = t.y + "px", i.onmouseover = function () {
                    n.cardSetTop(i, t.y - 10)
                }, i.onmouseout = function () {
                    n.cardSetTop(i, t.y)
                };
                var e = Math.round(t.angle), r = ["Webkit", "Moz", "O", "ms"];
                r.forEach(function (t) {
                    i.style[t + "Transform"] = "rotate(" + e + "deg) translateZ(0)"
                })
            })
        }
    }

    function e(t, a, n, i, e, r, o) {
        var s, h = Math.radiansToDegrees(Math.atan(n * r / a)), c = {N: 270, S: 90, E: 0, W: 180}[e],
            d = c - .5 * h * (t - 1), f = [], l = 99999, u = 99999, p = -l, g = -u;
        for (s = 0; s < t; s++) {
            var M = d + h * s, m = Math.degreesToRadians(M), v = n / 2 + Math.cos(m) * a, x = i / 2 + Math.sin(m) * a;
            l = Math.min(l, v), u = Math.min(u, x), p = Math.max(p, v), g = Math.max(g, x), f.push({
                x: v,
                y: x,
                angle: M + 90
            })
        }
        var y = Math.getRotatedDimensions(f[0].angle, n, i), w = 0, S = 0;
        return "N" === e ? (w = l * -1, w += (y[0] - n) / 2, S = u * -1) : "S" === e ? (w = l * -1, w += (y[0] - n) / 2, S = (u + (g - u)) * -1) : "W" === e ? (S = u * -1, S += (y[1] - i) / 2, w = l * -1, w += i - Math.rotatePointInBox(0, 0, 270, n, i)[1]) : "E" === e && (S = u * -1, S += (y[1] - i) / 2, w = a * -1, w -= i - Math.rotatePointInBox(0, 0, 270, n, i)[1]), f.forEach(function (t) {
            t.x += w, t.x = Math.round(t.x), t.y += S, t.y = Math.round(t.y), t.angle = Math.round(t.angle)
        }), o.width = f[t - 1].x + n, o.height = f[t - 1].y + i, f
    }

    var r = {
        options: {spacing: .2, radius: 400, flow: "horizontal", fanDirection: "N", imagesUrl: "cards/"},
        cid: function (t) {
            var a = t.attr("src");
            return a.substring(a.length - 6, a.length - 4)
        },
        play: function (t) {
            t.parents(".active-hand").length > 0 && this.playCard(t)
        },
        remove: function (t) {
            var a = t.parent();
            t.addClass("removed"); // Add a class to the pressed card
            a.hasClass("fan") && this.fan(a);
        },
        fan: function (e, r) {
            var o, s = t.extend({}, this.options);
            s = t.extend(s, n(e, "fan")), r && (s = t.extend(s, r)), e.data("fan", "radius: " + s.radius + "; spacing: " + s.spacing), a(e, s.cards), o = e.find("img.card"), 0 !== o.length && (s.width && o.width(s.width), i(o, this, s))
        },
        hand: function (i, e) {
            var r, o, s, h = t.extend({}, this.options);
            h = t.extend(h, n(i, "hand")), e && (h = t.extend(h, e)), i.data("hand", "flow: " + h.direction + ";"), i.removeClass("hhand fan hhand vhand vhand-compact hhand-compact"), "vertical" === h.flow && h.spacing >= 1 ? i.addClass("vhand") : "horizontal" === h.flow && h.spacing >= 1 ? i.addClass("hhand") : "vertical" === h.flow ? i.addClass("vhand-compact") : i.addClass("hhand-compact"), a(i, h.cards), r = i.find("img.card"), 0 !== r.length && (h.width && r.width(h.width), o = h.width || r[0].clientWidth || 70, s = r[0].clientHeight || Math.floor(1.4 * o), "vertical" === h.flow && h.spacing < 1 ? (r.slice(1).css("margin-top", -s * (1 - h.spacing)), r.slice(1).css("margin-left", 0)) : "horizontal" === h.flow && h.spacing < 1 && (r.slice(1).css("margin-left", -o * (1 - h.spacing)), r.slice(1).css("margin-top", 0)))
        },
        cardSetTop: function (t, a) {
            t.style.top = a + "px"
        },
        cardNames: function (t) {
            var a, n, i = [];
            for ("string" == typeof t && (t = t.split(" ")), a = 0; a < t.length; ++a) t[a] && (n = t[a].toString().toUpperCase(), i.push(n));
            return i
        }
    };
    if (r.playCard = r.remove, t(window).on("load", function () {
        t(".fan:not([data-bind])").each(function () {
            r.fan(t(this))
        }), t(".hand[data-hand]").each(function () {
            r.hand(t(this))
        }), t(".hand").on("click", "img.card", function () {
            r.play(t(this))
        })
    }), cardsScript && cardsScript.src) {
        var o = cardsScript.src.substring(0, cardsScript.src.lastIndexOf("/")) + "/cards/";
        r.options.imagesUrl = o
    }
    return r
}), Math.degreesToRadians || (Math.degreesToRadians = function (t) {
    return t * (Math.PI / 180)
}), Math.radiansToDegrees || (Math.radiansToDegrees = function (t) {
    return t * (180 / Math.PI)
}), Math.getRotatedDimensions || (Math.getRotatedDimensions = function (t, a, n) {
    var i = t * Math.PI / 180, e = Math.sin(i), r = Math.cos(i), o = r * a, s = e * a, h = -e * n, c = r * n,
        d = r * a - e * n, f = e * a + r * n, l = Math.min(0, o, h, d), u = Math.max(0, o, h, d),
        p = Math.min(0, s, c, f), g = Math.max(0, s, c, f);
    return [Math.floor(u - l), Math.floor(g - p)]
}), Math.rotatePointInBox || (Math.rotatePointInBox = function (t, a, n, i, e) {
    n = Math.degreesToRadians(n);
    var r = i / 2, o = e / 2, s = t - r, h = a - o, c = Math.sqrt(s * s + h * h), d = Math.atan2(h, s) + n,
        f = Math.cos(d) * c, l = Math.sin(d) * c;
    return [f + r, l + o]
});