(function(e) {
  e.jqmCalendar = function(t, n) {
    function h() {
      i.settings = e.extend({}, r, n);
      o = e("<table/>");
      var t = e("<thead/>").appendTo(o),
        h = e("<tr/>").appendTo(t),
        p = e("<th class='ui-bar-" + i.settings.headerTheme + " header' colspan='7'/>");
      l = e("<a href='" + i.settings.route + "' data-role='button' data-icon='carat-l' data-iconpos='notext' class='previous-btn'>Previous</a>").data("date", d(i.settings.date, -1)).appendTo(p);
      u = e("<span/>").appendTo(p);
      c = e("<a href='" + i.settings.route + "' data-role='button' data-icon='carat-r' data-iconpos='notext' class='next-btn'>Next</a>").data("date", d(i.settings.date, 1)).appendTo(p);
      l.click(function(t) {
        var n = e(this).data("date");
        S(n, true);
        c.data("date", d(n, 1));
        e(this).data("date", d(n, -1))
      });
      c.click(function(t) {
        var n = e(this).data("date");
        S(n, true);
        l.data("date", d(n, -1));
        e(this).data("date", d(n, 1))
      });
      p.appendTo(h);
      h = e("<tr/>").appendTo(t);
      for (var v = 0, m = [].concat(i.settings.days, i.settings.days).splice(i.settings.startOfWeek, 7); v < 7; v++) {
        h.append("<th class='ui-bar-" + i.settings.theme + " dayName'>" + m[v] + "</th>")
      }
      a = e("<tbody/>").appendTo(o);
      o.appendTo(s);
      f = e("<ul data-role='listview' data-theme='" + i.settings.dataTheme + "' data-divider-theme='" + i.settings.dividerTheme + "' />").insertAfter(o);
      i.settings.transposeTimezone(i.settings.events);
      S(i.settings.date, true)
    }

    function p(e) {
      for (var t = 0, n; n = i.settings.events[t]; t++) {
        i.settings.events[t].start = new Date(i.settings.events[t].start.getTime() - i.settings.events[t].start.getTimezoneOffset() + (new Date).getTimezoneOffset() * 6e4);
        i.settings.events[t].end = new Date(i.settings.events[t].end.getTime() - i.settings.events[t].end.getTimezoneOffset() + (new Date).getTimezoneOffset() * 6e4)
      }
    }

    function d(e, t) {
      return new Date(e.getFullYear(), e.getMonth() + t, 1)
    }

    function v(e) {
      return (new Date(e.getFullYear(), e.getMonth(), 1)).getDay()
    }

    function m(e, t) {
      var n = t || v(e),
        r = n - i.settings.startOfWeek;
      return r > 0 ? r : 7 + r
    }

    function g(e) {
      return (new Date(e.getFullYear(), e.getMonth() + 1, 0)).getDate()
    }

    function y(e, t, n, r) {
      return (t || b(e)) * 7 - (n || g(e)) - (r || m(e))
    }

    function b(e, t, n) {
      return i.settings.weeksInMonth ? i.settings.weeksInMonth : Math.ceil(((t || g(e)) + (n || m(e))) / 7)
    }

    function w($row, date, darker, selected) {
      // var o = e("<td class='ui-body-" + i.settings.theme + "'/>").appendTo(t),
      //     u = e("<a href='#' class='ui-btn ui-btn-up-" + i.settings.theme + "'/>").html(n.getDate().toString()).data("date", n).click(E).appendTo(o);
      // if (s) u.click();
      // if (r) {
      //     o.addClass("lowres")
      // } else {
      //     var a = 0;
      //     for (var f = 0, l, c = new Date(n.getFullYear(), n.getMonth(), n.getDate(), 0, 0, 0, 0), h = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1, 0, 0, 0, 0); l = i.settings.events[f]; f++) {
      //         if (l[i.settings.end].getTime() >= c.getTime() && l[i.settings.begin].getTime() < h.getTime()) {
      //             a++;
      //             break
      //         }
      //     }
      //     if (a > 0) {
      //         u.addClass("hasEvent")
      //     }
      //     var p = new Date;
      //     if (n.getFullYear() === p.getFullYear() && n.getMonth() === p.getMonth() && n.getDate() === p.getDate()) {
      //         u.addClass("ui-btn-today")
      //     }
      // }

      var $td = $("<td class='ui-body-" + i.settings.theme + "'/>").appendTo($row),
        $a = $("<a href='" + i.settings.route + "' class='ui-btn ui-btn-up-" + i.settings.theme + "'/>")
          .html(date.getDate().toString())
          .data('date', date)
          .click(E)
          .appendTo($td);

      if (selected) $a.click();

      if (r) {
        $td.addClass("darker");
      }

      var importance = 0;

      // Find events for this date
      for (var f = 0,
          event,
          begin = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0),
          end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0, 0); event = i.settings.events[f]; f++) {
        if (event[i.settings.end] >= begin && event[i.settings.begin] < end) {
          importance++;
          if (importance > 1) break;
        }
      }

      if (importance > 0) {
        $a.append("<span>&bull;</span>");
      }
      var today = new Date();
      if (date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()) {
        $a.addClass("ui-btn-today");
      } else {
        $a.addClass("importance-" + importance.toString());
      }
    }

    function E(t) {
      var n = e(this),
        r = n.data("date");
      a.find("a.ui-btn-active").removeClass("ui-btn-active");
      n.addClass("ui-btn-active");
      if (r.getMonth() !== i.settings.date.getMonth()) {
        S(r, false);
        l.data("date", d(r, -1));
        c.data("date", d(r, 1))
      } else {
        s.trigger("change", r)
      }
    }

    function S(t, n) {
      i.settings.date = t = t || i.settings.date || new Date;
      var r = t.getFullYear(),
        o = t.getMonth(),
        f = m(t),
        l = g(t),
        c = i.settings.weeksInMonth || b(t, l, f);
      if ((l + f) / 7 - c === 0) c++;
      a.empty();
      u.html(r.toString() + "年 " + i.settings.months[o]);
      for (var h = 0, p = 1, d = 1; h < c; h++) {
        var v = 0,
          y = e("<tr/>").appendTo(a);
        while (f > 0) {
          w(y, new Date(r, o, 1 - f), true);
          f--;
          v++
        }
        while (v < 7 && p <= l) {
          w(y, new Date(r, o, p), false, !n && p === t.getDate());
          v++;
          p++
        }
        while (p > l && v < 7) {
          w(y, new Date(r, o, l + d), true);
          v++;
          d++
        }
      }
      if (n) i.settings.monthItemsFormatter(x(t));
      s.trigger("create")
    }

    function x(e) {
      var t = [];
      for (var n = 0, r, s = new Date(e.getFullYear(), e.getMonth(), 1, 0, 0, 0, 0), o = new Date(e.getFullYear(), e.getMonth(), g(e), 23, 59, 59, 999); r = i.settings.events[n]; n++) {
        if (r[i.settings.end] >= s && r[i.settings.begin] < o) {
          t.push(r)
        }
      }
      t.sort(function(e, t) {
        return e["start"] > t["start"] ? 1 : e["start"] < t["start"] ? -1 : 0
      });
      return t
    }

    function T(t, n) {
      t.find("h3").append(n.name);
      var r = e.format.date(n.start, i.settings.dateFormat);
      var s = e.format.date(n.end, i.settings.dateFormat);
      if (r == s) {
        t.find("p").append("<strong " + (n.is_complete ? "style='text-decoration: line-through;'" : "") + ">" + n[i.settings.title] + "</strong><br><small>" + ((n[i.settings.summary]) ? n[i.settings.summary].replace("\n", "<br>") : '') + "</small> </p><p>" + r)
      } else {
        t.find("p").append("<strong " + (n.is_complete ? "style='text-decoration: line-through;'" : "") + ">" + n[i.settings.title] + "</strong><br><small>" + ((n[i.settings.summary]) ? n[i.settings.summary].replace("\n", "<br>") : '') + "</small> </p><p>" + r + "&nbsp;&nbsp;&rarr;&nbsp;&nbsp;" + s)
      } if (n[i.settings.icon]) {
        t.attr("data-icon", n.icon)
      }
    }

    function N(t) {

      f.empty();
      if (t.length) {
        var n = "";
        for (var r = 0, s; s = t[r]; r++) {
          if (n != e.format.date(s.start, "yyyyMMMMdd")) {
            var o = e('<li data-role="list-divider">' + e.format.date(s.start, i.settings.dateFormatTitle) + "</li>").appendTo(f);
            n = e.format.date(s.start, "yyyyMMMMdd")
          }
          var u = e("<li class='ui-event-item'><a href='" + i.settings.route + "/" + s['_id'] + "' class='event-item-link' rel='" + s.eid + "'><h3></h3><p></p></a></li>").appendTo(f);
          i.settings.listItemFormatter(u, s)
        }
      } else {
        var u = e("<li class='ui-event-item'><p style='padding-top:0.65em;'><strong>选定的月份没有安排任务</strong></p></li>").appendTo(f)
      }
      f.trigger("create").filter(".ui-listview").listview("refresh")
    }
    var r = {
      events: [],
      begin: "start",
      end: "end",
      title: "title",
      summary: "description",
      location: "location",
      icon: "icon",
      url: "url",
      allDayTimeString: "",
      headerTheme: "b",
      theme: "b",
      dataTheme: "d",
      dividerTheme: "b",
      date: new Date,
      dateFormatTitle: "dd MMMM, yyyy",
      dateFormat: "dd MMMM, yyyy",
      version: "1.2.2",
      months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      days: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
      weeksInMonth: 6,
      startOfWeek: 1,
      listItemFormatter: T,
      monthItemsFormatter: N,
      transposeTimezone: p,
      route: ''
    };
    var i = this;
    i.settings = null;
    var s = e(t).addClass("jq-calendar-wrapper"),
      o, u, a, f, l, c;
    s.bind("change", function(t, n) {
      var r = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1, 0, 0, 0, 0);
      var s = false;
      // console.log(f);
      f.empty();
      e('<li data-role="list-divider">' + e.format.date(n, i.settings.dateFormatTitle) + "</li>").appendTo(f);
      for (var o = 0, t; t = i.settings.events[o]; o++) {
        if (t[i.settings.end] >= n && t[i.settings.begin] < r) {
          var u = e("<li class='ui-event-item'><a href='" + i.settings.route + "/" + t['_id'] + "' class='event-item-link' rel='" + t.eid + "'><h3></h3><p></p></a></li>").appendTo(f);
          i.settings.listItemFormatter(u, t);
          s = true
        }
      }
      if (!s) var u = e("<li class='ui-event-item'><p style='padding-top:0.65em;'><strong>选定的日期没有安排任务</strong></p></li>").appendTo(f);
      f.trigger("create").filter(".ui-listview").listview("refresh")
    });
    s.bind("refresh", function(e, t, flag) {
      //console.log(t, flag);
      //重新指定外面的按钮的hash bang
      // console.log(l);
      l.attr('href',i.settings.route)
      c.attr('href',i.settings.route)
      // console.log(l);
      S(t, flag)
    });
    h()
  };
  e.fn.jqmCalendar = function(t) {
    return this.each(function() {
      if (!e(this).data("jqmCalendar")) {
        e(this).data("jqmCalendar", new e.jqmCalendar(this, t))
      }
    })
  }
})(jQuery)