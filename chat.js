$(".scroll-area").mCustomScrollbar();

/* ウィンドウ */

function windowResized() {
    const viewportHeight = window.innerHeight;
    document.documentElement.style.setProperty('--viewportHeight', `${viewportHeight}px`);
}
window.addEventListener('resize', windowResized);
windowResized();

function isMobile() {
    const ua = navigator.userAgent;
    return ua.indexOf('iPhone') >= 0 || ua.indexOf('iPad') >= 0 || ua.indexOf("iPod") >= 0 || ua.indexOf('Android') >= 0;
}

/* キャラクター選択 */

var character = decodeURIComponent(location.hash.trim().replace("#", ""));
if (!character) {
    character = "結城 友奈";
}

function characterButtonClicked() {
    if (character != $(this).text().trim()) {
        character = $(this).text().trim()
        location.hash = `#${character}`
        location.reload();
    }
}
$(".character_btn").click(characterButtonClicked);

function changeCharacter() {
    $(".user_img").attr("src", `./icon/${character}.png`)
                  .attr("alt", character);
    $("#character_dropdown").text(character);
    $("title").html(`ゆゆチャ - ${character}`);
}
changeCharacter();

/* ボイス ON/OFF */

var voiceOn = true;

function setVoiceOn() {
    $("#voiceSwitchButton i").removeClass("fa-volume-mute");
    $("#voiceSwitchButton i").addClass("fa-volume-up");
    $("#autoVoiceOnNotice").css({"display": "inline-block"});
    voiceOn = true;
}
function setVoiceOff() {
    $("#voiceSwitchButton i").removeClass("fa-volume-up");
    $("#voiceSwitchButton i").addClass("fa-volume-mute");
    $("#autoVoiceOnNotice").css({"display": "none"});
    voiceOn = false;
}
$("#voiceSwitchButton").on("click", function(e){
    if (voiceOn) {
        setVoiceOff();
    } else {
        setVoiceOn();
    }
});
setVoiceOn();

/* クエリ送信 */

$("#query_input").keypress(function(e){
    if(e.which == 13){
        $("#send_btn").click();
    }
});

function sendButtonClicked() {
    let query = $("#query_input").val().trim()
    if (query) {
        let context = "";
        addUserMessage(query);
        $(".msg_body").each(function(){
            let utterance = $(this).text();
            if (utterance) {
                if ($(this).hasClass("bot")) {
                    context += `<${character}>` + utterance + "</s>";
                } else if ($(this).hasClass("usr")) {
                    context += "<某>" + utterance + "</s>"
                }
            }
        });
        context += "<" + character + ">";
        $("#query_input").val("")
        sendTextRequest(context);
    }
}

function sendTextRequest(context) {
    disableForm("相手が書き込んでいます…");
    request = { "context": context };
    $.ajax({type: "post",
            contentType: 'application/json',
            data: JSON.stringify(request),
            dataType: "text",
            timespan: 30000,
            url: 'https://asia-northeast2-yuyuyui-script-search-20200915.cloudfunctions.net/chatbot'})
    .done(function(response) {
        try {
            if (voiceOn) {
                let callback = function(response, voiceAudio) {
                    addBotMessage(response, voiceAudio);
                }
                sendVoiceRequest(response, callback);
            } else {
                addBotMessage(response);
                enableForm();
            }
        } catch (error) {
            addErrorMessage("エラー：応答の処理中にエラーが発生しました。");
            enableForm();
            throw error;
        }
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
        const error_descriptions = {
            0:   "チャットサーバーに接続できません。引き続き発生する場合は5分待ってからお試しください。",
            400: "入力を読み取れませんでした。",
            408: "チャットサーバーが混み合っている可能性があります。引き続き発生する場合は5分待ってからお試しください。",
            500: "チャットサーバーでエラーが発生しました。",
        };
        let message = "";
        if (error_descriptions[jqXHR.status]) {
            message += "エラー：" + error_descriptions[jqXHR.status];
        } else {
            message += "エラー";
        }
        message += `(${jqXHR.readyState}, ${jqXHR.status}, ${textStatus}, ${errorThrown.message})`;
        addErrorMessage(message);
        enableForm();
    })
    .always(function() {
    })
}

function sendVoiceRequest(text, callback) {
    disableForm("相手が読み上げています…");
    request = { "character_name": character, "text": text };

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://asia-northeast2-yuyuyui-script-search-20200915.cloudfunctions.net/speech-synthesis", async=true);
    xhr.setRequestHeader("Content-Type", "application/json")
    xhr.responseType = 'arraybuffer';
    xhr.onload = function(e) {
        if (voiceOn) {
            let voiceBlob = new Blob([xhr.response], {type: "audio/mp3"});
            let voiceUrl = URL.createObjectURL(voiceBlob);
            let voiceAudio = new Audio(voiceUrl);
            voiceAudio.load();
            voiceAudio.play();
            callback(text, voiceAudio);
        } else {
            callback(text);
        }
        enableForm();
    };
    xhr.onerror = function(e) {
        addErrorMessage(`音声が取得できませんでした。`);
        callback(text);
        enableForm();
    }

    xhr.send(JSON.stringify(request));
}

/* 音声再生 */

function onBotMessageClick(e) {
    if (voiceOn) {
        let voiceAudio = $(this).find("audio").get(0);
        voiceAudio.load();
        voiceAudio.play();
    }
}

/* メッセージ追加 */

function addUserMessage(message) {
    const parent = $("#user_message_template").parent()
    const template = $("#user_message_template").clone().attr('id', null).attr('style', null);
    addMessage(parent, template, message);
}

function addBotMessage(message, voiceAudio) {
    const parent = $("#bot_message_template").parent()
    const template = $("#bot_message_template").clone().attr('id', null).attr('style', null);
    const voice_available_mark = template.find(".voice_available_mark").clone();
    template.find(".user_img_msg").attr("src", "icon/" + character + ".png")
                                  .attr("alt", character);
    addMessage(parent, template, message);
    if (voiceAudio) {
        template.find(".msg_cotainer_bot").addClass("voice_available");
        template.find(".msg_body").append(voice_available_mark);
        template.find(".msg_body").append(voiceAudio);
        template.find(".msg_cotainer_bot").get(0).addEventListener("click", onBotMessageClick, false);
    }
}

function addErrorMessage(message) {
    const parent = $("#error_message_template").parent()
    const template = $("#error_message_template").clone().attr('id', null).attr('style', null);
    addMessage(parent, template, message);
}

function addMessage(parent, template, message) {
    const time = new Date().toLocaleTimeString("en-US", {hour12: true, timeStyle: "short"});
    template.find(".msg_body").text(message);
    template.find(".msg_time").text(time);
    parent.append(template);

    template.addClass('animated').addClass('fadeInUp');
    setTimeout(function() {
        template.removeClass('fadeInUp');
    }, 1000);

    $(".scroll-area").mCustomScrollbar('scrollTo', 'bottom', {scrollInertia:300});
}

function disableForm(placeholder) {
    $("#query_input").attr("disabled", "disabled");
    $("#query_input").attr("placeholder", placeholder);
    $("#send_btn").addClass("disabled");
    $('#send_btn').attr("disabled", "disabled");
    $('#send_btn').off("click");
    $('#attach_btn').attr("disabled", "disabled");
    $('#attach_btn').off("click");
}

/* コントロール */

function enableForm() {
    $("#query_input").attr("disabled", null);
    $("#query_input").attr("placeholder", null);
    if (!isMobile()) { $("#query_input").focus(); }
    $("#send_btn").attr("disabled", null);
    $('#send_btn').on("click", sendButtonClicked);
    $('#attach_btn').on("click", fillSuggestedQueries);
    $('#attach_btn').attr("disabled", null);
}

function screenShot() {
    $("#mCSB_1_container").addClass("screenshot_bench");
    $("#screenShotHeader").text($("title").text());
    const render_options = {
        scale: Math.max(window.devicePixelRatio, 2),
        backgroundColor: null,
    }
    html2canvas($("#mCSB_1_container")[0], render_options).then(canvas => {
        $("#mCSB_1_container").removeClass("screenshot_bench");
        try {
            $("#screenShotImage").attr("src", canvas.toDataURL());
        } catch (e) {
            let parent = $("#screenShotImage").parent();
            $("#screenShotImage").replaceWith(canvas);
            parent.children("canvas").attr("id", "#screenShotImage");

        }
        (new bootstrap.Modal(document.getElementById("screenShotModal"))).show();
    });
}
$("#screenShotButton").on("click", screenShot);

function fillSuggestedQueries() {
    const suggested_queries = [
        "おなかがすいてきた。",
        "お菓子食べる？",
        "うどん食べに行かない？",
        "うどんと蕎麦どっちが好き？",
        "お昼ごはんは何食べる？",
        "一緒にうどん作る？",
        "晩ごはんは何にしようかな。",
        "一番好きなのは誰？",
        "好きです！付き合ってください！",
        "デートの行き先はどこにしようかな。",
        "香川に行くんだけど何がおすすめ？",
        "もうすぐちょうさ祭りだね！",
        "観音寺の住職って知ってる？",
        "琴弾廻廊には行ったことある？",
        "そろそろ眠くなってきた。",
        "髪にバーテックス付いてたよ。",
        "勇者部に新入部員は入ったのかな？",
        "奈良ってどんなところ？",
        "こんど長野の諏訪大社に行くよ。",
        "夏の北海道の見どころは？",
        "沖縄ってどんなところなんだろうね～。",
        "今日はどんなことしよう？",
        "昨日の授業はどうだった？",
        "私を慰めて。",
        "お菓子づくりのコツ？",
    ];
    $("#query_input").val(suggested_queries[Math.floor(Math.random() * suggested_queries.length)]);
    if (!isMobile()) { $("#query_input").focus(); }
}
/*
const initial_utterances = {
    "乃木 園子": [
        "こんにちは〜、乃木園子って言います〜。",
        "こんばんわ～。いい月が出ているねぇ。",
        "むにゃ……ふあ……おはよーございます〜。",
        "さぁ、次はどう来るのかな？何が来てもはじき返すよ～！",
        "こんにちは〜！",
        "……んん……ん……？あ、寝ちゃってた〜。",
        "ちょっと話を聞いてみよ～！すみませーん！",
        "面白そうだけど、やったことないから、できるかな〜？　できなかったらごめんね〜。",
        "落ち着いて聞いてね。壁の外の秘密……この世界の成り立ちを、教えてあげる……。",
        "ふぉっふぉっ……なぁに。老いぼれの世迷い言じゃ。話し半分で聞いとけばええ。",
        "乃木園子だよ〜。いつもお姉さんにはお世話になってます〜。",
        "はいはーい！この乃木園子にお任せあれ〜！",
        "乃木園子と申します。どうぞよろしくお願い致します。",
        "はい、紅茶をどうぞ〜。乃木家のオリジナルブレンドです〜。",
        "じゃあ、今日の私はハッピネス園子アルティメットで〜♪",
        "おいでやす、若女将の園子どす。",
        "全力で来〜い！　でなければ、このダークネス園子プロトタイプは倒せぬぞ〜！",
        "かーっかっかっ！皆の者、園子たちにひれ伏すのじゃ～！",
        "それでは、作演出、乃木園子と乃木園子の、愛憎渦巻く喜劇の舞台をお楽しみください！",
        "ダブル園子で頑張るんよ〜。",
        "蟻さーん。ＨＥＹＨＥＹ園子だよー。",
        "フヘヘ……その辺は、この情報屋園子にお任せくだせえ……ダンナ。",
        "今日は何して遊ぼうか〜。",
        "は～い、そのっちだよ～。",
    ],
    "弥勒 夕海子": [
        "ホホホホ！　よろしくてよ。この弥勒家の末裔に、全てお任せあれ！",
        "ダイヤでも真珠でもトリュフでも石油でも、この弥勒夕海子にお任せあれ！",
        "弥勒夕海子、推参!!!",
        "ごきげんよう皆様！勇者部の涼風、弥勒夕海子ですわよ～♪",
        "弥勒夕海子…と。ふふん、弥勒家にふさわしい優美かつ荘厳な字で書けましたわ。",
        "こうなればいよいよ！　この弥勒夕海子の出番と相成りましてございますわね！",
        "誰もが待ちわびていたことでしょう。この弥勒夕海子の登場を!!",
        "わたくしは弥勒夕海子。４月２７日に高知県にて出生し、今は中学３年生です。",
        "よろしい。この、弥勒夕海子。皆様の昼食コンシェルジュになりましてよ！",
        "ここにいらしたということは、わたくしのティーを御所望なのでしょう？",
        "はい！　弥勒夕海子ですわ！",
        "仕方ありませんわね、弥勒家の実家にあるわたくしの超広い部屋を使っていただいても構いませんわよ？",
        "ようこそ弥勒家別邸へ！",
        "では皆さんには代わりに、弥勒家の華麗なる歴史をお聞かせしましょうか？",
        "ふふん、この程度、弥勒家の血を引くわたくしには朝飯前ですわ！",
        "気軽に弥勒さんと呼んでくださいまし。弥勒と呼び捨てでもよろしいですわ。",
        "ところで皆さんにひとつ質問があるのですが。名家・弥勒家の事はご存じでして？",
        "お耳のお穴かっぽじって聞いておりますわ！弥勒イヤーは地獄耳でしてよ！",
        "わたくしの優雅なティータイムの邪魔はお控えになって！",
        "さ、どうぞおかけになって。ささ、御遠慮なさらず。さささ。",
        "お嬢様といえば何はなくとも優雅なティータイム！アルフレーッド！　お茶菓子の用意を！",
        "わたくしは、アルフレッドに言ってティーセットを持って来させますわ。",
        "こうして波の音を聞きながら優雅にティータイムを楽しむことも、心の鍛錬になっていますわ。",
        "海を眺めながらの優雅なティータイム…わたくしにふさわしいですわ。",
    ],
};
addBotMessage(initial_utterances[character][Math.floor(Math.random() * initial_utterances[character].length)]);
*/
enableForm();