$(".scroll-area").mCustomScrollbar();

function windowResized() {
    const viewportHeight = window.innerHeight;
    document.documentElement.style.setProperty('--viewportHeight', `${viewportHeight}px`);
}
window.addEventListener('resize', windowResized);
windowResized();

function isMobile() {
    const ua = navigator.userAgent;
    return ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1 || ua.indexOf('Android') > -1;
}

function sendButtonClicked() {
    let query = $("#query_input").val().trim()
    if (query) {
        $("#query_input").val("")
        request = { "character": "乃木 園子", "query": query };
        addUserMessage(query);
        sendRequest(request);
    }
}

function sendRequest(request) {
    disableForm();
    $.ajax({type: "post",
            contentType: 'application/json',
            data: JSON.stringify(request),
            dataType: "text",
            timespan: 30000,
            url: 'https://asia-northeast2-yuyuyui-script-search-20200915.cloudfunctions.net/chatbot'})
    .done(function(response) {
        try {
            addBotMessage(response);
        } catch (error) {
            addBotMessage("エラー：応答の処理中にエラーが発生しました。");
        }
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
        const error_descriptions = {
            0:   "ネットワークに接続できていない可能性があります。",
            400: "入力を読み取れませんでした。",
            408: "チャットが混み合っている可能性があります。",
            500: "サーバーでエラーが発生しました。",
        };
        let message = "";
        if (error_descriptions[jqXHR.status]) {
            message += "エラー：" + error_descriptions[jqXHR.status];
        } else {
            message += "エラー";
        }
        message += `(${jqXHR.status}, ${textStatus}, ${errorThrown.message})`;
        addBotMessage(message);
    })
    .always(function() {
        enableForm();
    })
}

$("#query_input").keypress(function(e){
    if(e.which == 13){
        $("#send_btn").click();
    }
});

function addUserMessage(message) {
    const parent = $("#user_message_template").parent()
    const template = $("#user_message_template").clone().attr('id', null).attr('style', null);
    addMessage(parent, template, message);
}

function addBotMessage(message, character="乃木 園子") {
    const parent = $("#bot_message_template").parent()
    const template = $("#bot_message_template").clone().attr('id', null).attr('style', null);
    template.find(".user_img_msg").attr("src", "icon/" + character + ".png")
                                  .attr("alt", character);
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

function disableForm() {
    $("#query_input").attr("disabled", "disabled");
    $("#query_input").attr("placeholder", "相手が書き込んでいます…");
    $("#send_btn").addClass("disabled");
    $('#send_btn').attr("disabled", "disabled");
    $('#send_btn').off("click");
    $('#attach_btn').attr("disabled", "disabled");
    $('#attach_btn').off("click");
}

function enableForm() {
    $("#query_input").attr("disabled", null);
    $("#query_input").attr("placeholder", null);
    if (!isMobile()) { $("#query_input").focus(); }
    $("#send_btn").attr("disabled", null);
    $('#send_btn').on("click", sendButtonClicked);
    $('#attach_btn').on("click", fillSuggestedQueries);
    $('#attach_btn').attr("disabled", null);
}

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

const initial_utterances = [
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

enableForm();