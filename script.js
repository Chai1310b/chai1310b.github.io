var program = {
    "07/17/2020 23:15": "tf1",
    "07/18/2020 08:55": "c8",
    "07/18/2020 12:40": "w9",
    "07/18/2020 17:55": "cstar",
    "07/18/2020 18:30": "c8",
    "07/18/2020 21:00": "france2",
}

var channels = {
    "tf1": {
        "name": "TF1",
        "logo": "https://upload.wikimedia.org/wikipedia/fr/thumb/7/77/TF1_%282013%29.svg/1200px-TF1_%282013%29.svg.png",
        "epg": "192"
    },
    "m6": {
        "name": "M6",
        "logo": "https://upload.wikimedia.org/wikipedia/fr/thumb/2/22/M6_2009.svg/1200px-M6_2009.svg.png",
        "epg": "118"
    },
    "c8": {
        "name": "C8",
        "logo": "https://upload.wikimedia.org/wikipedia/fr/thumb/7/7d/Logo_C8.svg/1200px-Logo_C8.svg.png",
        "epg": "445"
    },
    "w9": {
        "name": "W9",
        "logo": "https://upload.wikimedia.org/wikipedia/fr/thumb/5/56/Logo_W9_2018.svg/1200px-Logo_W9_2018.svg.png",
        "epg": "119"
    },
    "cstar": {
        "name": "CSTAR",
        "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Cstar-logo.jpg/1200px-Cstar-logo.jpg",
        "epg": "458"
    },
    "france2": {
        "name": "France 2",
        "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/France_2_2018.svg/1181px-France_2_2018.svg.png",
        "epg": "4"
    },
}

var weekday = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

function init() {
    for (event in program) {
        add(new Date(event), program[event]);
    }
}

function add(date, channel) {
    var channel_info = channels[channel];
    var clone = $("#model").clone();
    $(".ui.container").append(clone);
    clone.attr("id", "");
    clone.attr("timestamp", date.getTime() / 1000);
    clone.attr("channel", channel);

    clone.find(".logo").attr("src", channel_info.logo);
    clone.find(".date .day").text(weekday[date.getDay()]);
    clone.find(".date .time").text(moment(date).format('HH:mm'));

    console.log("channel", channel_info.name, "added");
}

function every() {
    const now = Date.now() / 1000;

    $(".ui.container .event:not(#model)").each(function(idx, elem) {
        var event = $(elem);
        const ts = parseInt(event.attr("timestamp"));
        const channel = event.attr("channel");
        
        var time = ts - now;
        if (time <= 0) {
            call(channels[channel]);
            event.transition('drop', function() {
                event.remove();
            });
        }
        event.find(".text").text(duration(time));
    });
}

function call(channel) {
    var epg_id = "*".repeat(10 - channel.epg.length) + channel.epg;
    console.log(channel, epg_id);
    $.get("http://192.168.1.10:8080/remoteControl/cmd?operation=09&epg_id=" + epg_id + "&uui=1");
}

var duration = (secs) => {
    var sec_num = parseInt(secs, 10)
    var hours   = Math.floor(sec_num / 3600)
    var minutes = Math.floor(sec_num / 60) % 60
    var seconds = sec_num % 60

    return [hours,minutes,seconds]
        .map(v => v < 10 ? "0" + v : v)
        .filter((v,i) => v !== "00" || i > 0)
        .join(":")
}

$(function() {
    init();

    every();
    setInterval(every, 1000);

    $("body").on("click", ".event", function() {
        var event = $(this);
        const channel = event.attr("channel");
        call(channels[channel]);
    });
});
