var program = {
    "01/14/2021 19:00": "c8",
    "01/14/2021 21:10": "tf1sf",
    "01/14/2022 23:00": "tf1",
    "01/15/2022 09:00": "tf1sf",
    "01/15/2022 17:50": "tf1",
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
        "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Logo_C8.svg/2560px-Logo_C8.svg.png",
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
    "tfx": {
        "name": "TFX",
        "logo": "https://upload.wikimedia.org/wikipedia/fr/thumb/8/83/TFX_logo_2018.svg/1200px-TFX_logo_2018.svg.png",
        "epg": "446"
    },
    "tmc": {
        "name": "TMC",
        "logo": "https://upload.wikimedia.org/wikipedia/fr/thumb/a/a8/TMC_logo_2016.svg/1200px-TMC_logo_2016.svg.png",
        "epg": "195"
    },
    "tf1sf": {
        "name": "TF1 Series Film",
        "logo": "https://upload.wikimedia.org/wikipedia/fr/thumb/5/5f/TF1_S%C3%A9ries_Films_logo_2018.svg/1280px-TF1_S%C3%A9ries_Films_logo_2018.svg.png",
        "epg": "1404"
    },
    "play": {
        "name": "PLAY",
        "logo": "https://www.vippng.com/png/full/205-2058917_play-icon-ville-de-saint-etienne.png",
        "button": "164"
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
        if (time < 1) {
            call(channels[channel]);
            event.transition('drop', function() {
                event.remove();
            });
        }
        event.find(".text").text(duration(time));

        if (idx == 0) {
            $(".main .text").text(duration(time));
        }
    });
}

function get_channel() {
    $.get("http://192.168.1.10:8080/remoteControl/cmd?operation=10").then(response => {
        if (response.result.data.osdContext == "netflix") {
            $(".main .logo").attr("src", "https://upload.wikimedia.org/wikipedia/commons/0/0f/Logo_Netflix.png");
        }
        var current_channel = response.result.data.playedMediaId.toString();
        for (channel in channels) {
            if (channels[channel].epg == current_channel) {
                console.log(current_channel);
                $(".main .logo").attr("src", channels[channel].logo);
            }
        }
    });
}

function call(channel) {
    if (channel.button != undefined) {
        $.get("http://192.168.1.10:8080/remoteControl/cmd?operation=01&key=" + channel.button + "&mode=0");
        return;
    }
    var epg_id = "*".repeat(10 - channel.epg.length) + channel.epg;
    $.get("http://192.168.1.10:8080/remoteControl/cmd?operation=09&epg_id=" + epg_id + "&uui=1").then(r => {
        $(".main .logo").attr("src", channel.logo);
    });
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

    get_channel();

    every();
    setInterval(every, 500);

    $("body").on("click", ".event", function() {
        var event = $(this);
        const channel = event.attr("channel");
        call(channels[channel]);
    });
});
