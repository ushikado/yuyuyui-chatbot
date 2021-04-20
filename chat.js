$(".scroll-area").mCustomScrollbar();

function sendButtonClicked() {
    var query = $("#query_input").val().trim()
    if (query) {
        $("#query_input").val("")
        request = { "character": "乃木 園子", "query": query };
        addUserMessage(query);
        sendRequest(request);
    }
}

function sendRequest(request) {
    disable_form();
    $.ajax({type: "post",
            contentType: 'application/json',
            data: JSON.stringify(request),
            dataType: "text",
            timespan: 10000,
            url: 'https://asia-northeast2-yuyuyui-script-search-20200915.cloudfunctions.net/chatbot'})
    .done(function(response) {
        try {
            addBotMessage(response);
        } catch (error) {
            addBotMessage("（応答の処理中にエラーが発生しました）");
        }
    })
    .fail(function(jqXHR, textStatus) {
        if (jqXHR.status == 400) {
            addBotMessage("（不正なリクエストが渡されました）");
        } else if (jqXHR.status == 500) {
            addBotMessage("（サーバーでエラーが発生しました）");
        }
    })
    .always(function() {
        enable_form();
    })
}

$("#query_input").keypress(function(e){
    if(e.which == 13){
        $("#send_btn").click();
    }
});

function addUserMessage(message) {
    var parent = $("#user_message_template").parent()
    var template = $("#user_message_template").clone().attr('id', null).attr('style', null);
    addMessage(parent, template, message);
}

function addBotMessage(message, character="乃木 園子") {
    var parent = $("#bot_message_template").parent()
    var template = $("#bot_message_template").clone().attr('id', null).attr('style', null);
    template.find(".user_img_msg").attr("src", "icon/" + character + ".png")
                                  .attr("alt", character);
    addMessage(parent, template, message);
}

function addMessage(parent, template, message) {
    var time = new Date().toLocaleTimeString("en-US", {hour12: true, timeStyle: "short"});
    template.find(".msg_body").text(message);
    template.find(".msg_time").text(time);
    parent.append(template);

    template.addClass('animated').addClass('fadeInUp');
    setTimeout(function() {
        template.removeClass('fadeInUp');
    }, 1000);

    $(".scroll-area").mCustomScrollbar('scrollTo', 'bottom', {scrollInertia:300});
}

function disable_form() {
    $("#query_input").attr("disabled", "disabled");
    $("#query_input").attr("placeholder", "相手が書き込んでいます…");
    $("#send_btn").addClass("disabled");
    $('#send_btn').attr("disabled", "disabled");
}

function enable_form() {
    $("#query_input").attr("disabled", null);
    $("#query_input").attr("placeholder", null);
    $("#query_input").focus();
    $("#send_btn").attr("disabled", null);
    $('#send_btn').on("click", sendButtonClicked);
}

var initial_utterances = [
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
];
addBotMessage(initial_utterances[Math.floor(Math.random() * initial_utterances.length)]);

enable_form();