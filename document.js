function msgbox(body, title) {
    title != undefined ? $("#msgboxTitle").text(title) : $("#msgboxTitle").text("Attention");
    $("#msgboxBody").html(body);
    $("#msgbox").modal("show");
}

function changeSubButton(text, state) {
    if (text != "") $("#sub").html(text);
    if (state != undefined) {
        if (state) {
            $("#sub").removeAttr("disabled");
        } else {
            $("#sub").attr("disabled", "true");
        }
    }
}

$(document).ready(function () {
    $("form").submit(event => event.preventDefault());
    getVoices();
    //Submit button state change
    changeSubButton('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>&nbsp;&nbsp;Please wait...', false);
    $("#sub").click(function () {
        if ($("#t").val().length <= 0) {
            msgbox("Type in something first!");
            return;
        }
        if (audioQueue.length <= 0) {
            changeSubButton('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>&nbsp;&nbsp;Please wait...', false);
            if (!process()) {
                $("#supplyMissingAudio").click();
                changeSubButton("Speak it!", true);
            } else {
                optimizeJSON();
                sendReq();
            }
        } else {
            if (player.ended && playerPointer >= audioQueue.length - 1) {
                console.log("Audio already retrieved. Start playing.");
                playerPointer = -1;
                // Play audioQueue directly.
                changeSubButton("Pause", true);
            } else {
                if (!player.ended && player.paused) {
                    player.play();
                    changeSubButton("Pause", true);
                } else if (!player.ended && !player.paused) {
                    player.pause();
                    changeSubButton("Resume", true);
                }
            }
        }
    });

    $("#showOnSelect").css("display", "none");

    const player = new Audio();
    player.loop = false;

    player.addEventListener("ended", () => {
        if (playerPointer >= audioQueue.length - 1) {
            if (audioQueue.length > 0) {
                if (audioQueue.length < jsonQueue.length) {
                    changeSubButton('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>&nbsp;&nbsp;Please wait...', false);
                } else {
                    changeSubButton("Replay", true);
                }
            } else {
                changeSubButton("Speak it!", true);
            }
        }
    });

    var docWatch = setInterval(function () {
        if (audioQueue.length > 0 && playerPointer < audioQueue.length - 1) //To make the audio start playing, audioQueue has to have sth, and playerPointer is -1.
        {
            if (player.ended || (!player.ended && playerPointer == -1)) {
                playerPointer++;
                player.src = audioQueue[playerPointer];
                console.log("Playing Audio #" + playerPointer);
                player.play();

                changeSubButton("Pause", true);
            }
        }

        if ($("#t")[0].selectionStart != $("#t").get(0).selectionEnd) {
            $("#showOnSelect").css("display", "inline");
        } else {
            $("#showOnSelect").css("display", "none");
        }

    }, 100);
});
$("#saveit").attr("disabled", "true");  //saveit button state change
$("#t").change(function () {
    jsonQueue = [];
    audioQueue = [];
    playerPointer = -1;
    abQueue = [];
    //Submit button state change
    changeSubButton("Speak it!", true);
    $("#saveit").attr("disabled", "true");  //saveit button state change

    try { player.pause(); } catch (e) { }
});
$("#t").on("input", () => $("#t").change());
$("#voice").change(() => $("#t").change());
$("#speedtxt").change(() => $("#t").change());
$("#speed").change(() => $("#t").change());
$(document).on("change input", ".range", function () {  //bind the change/input event of range on document so that later generated ranges can also have the event.
    $(this).next(".rangetxt").val($(this).val());
});
$(document).on("change input", ".rangetxt", function () {
    $(this).prev(".range").val($(this).val());
});

$("#insertpausedlg").on('shown.bs.modal', () => {
    let t = $("#insertpausedlg").find("#pausetime");
    t.focus();
    t.select();
});
$("#dlgok7").click(() => {
    let sec = $("#insertpausedlg").find(":checked").attr("id").replace("ec", "");
    let pause = $("#insertpausedlg").find("#pausetime").val();
    insertText("<break time='" + pause + sec + "' />");
});
$("#insertpausedlg").find("#pausetime").keypress((event) => {
    if (event.which == 13) {
        event.preventDefault();
        $("#dlgok7").click();
    }
});
$("#insertpausedlg").find("#pausetime").on("input change", () => {
    if ($("#insertpausedlg").find("#pausetime").val() == "") {
        $("#dlgok7").attr("disabled", "true");
    } else {
        $("#dlgok7").removeAttr("disabled");
    }
});

$("#insertrepeatdlg").on("shown.bs.modal", () => {
    let t = $("#repeattimes");
    t.focus();
    t.select();
});
$("#dlgok8").click(() => {
    let count = $("#repeattimes").val();
    wrapText("<repeat count='" + count + "'>", "</repeat>");
});
$("#insertrepeatdlg").find("#repeattimes").keypress((event) => {
    if (event.which == 13) {
        event.preventDefault();
        $("#dlgok8").click();
    }
});
$("#insertrepeatdlg").find("#repeattimes").on("input change", () => {
    if ($("#insertrepeatdlg").find("#repeattimes").val() == "") {
        $("#dlgok8").attr("disabled", "true");
    } else {
        $("#dlgok8").removeAttr("disabled");
    }
});
$("#insertRepeat").click(() => {
    let t = $("#t");
    let tt = t.val();
    let st = tt.substring(t.get(0).selectionStart, t.get(0).selectionEnd);
    if (st.includes("<repeat ") || st.includes("</repeat>")) {
        msgbox("Please do not insert <code>&lt;repeat&gt;</code> tags over other <code>&lt;repeat&gt;</code> tags.");
    } else {
        $("#insertrepeatdlg").modal("show");
    }
});

$("#changevoice").click(() => {
    let t = $("#t");
    let tt = t.val();
    let st = tt.substring(t.get(0).selectionStart, t.get(0).selectionEnd);
    if (st.includes("<voice ") || st.includes("</voice>")) {
        msgbox("Please do not insert <code>&lt;voice&gt;</code> tags over other <code>&lt;voice&gt;</code> tags.");
    } else {
        if ($("#dlgvoicelist0 > #voice").val() == undefined) {
            $("#dlgvoicelist0").append($($("body").find("#voice")[0]).clone());
            $("#dlgvoicerate0").append($($("body").find("#speakingrate")[0]).clone());
        }
        $("#choosevoicedlg").modal("show");
    }
});
$("#dlgok0").click(() => {
    let t = $("#t");
    let tt = t.val();
    let st = tt.substring(t.get(0).selectionStart, t.get(0).selectionEnd);
    let v = $($("#choosevoicedlg").find("#voice")[0]).val();
    let r = $($("#choosevoicedlg").find("#speed")[0]).val();
    if (r == $($("mainform").find("#speed")[0]).val()) {
        wrapText("<voice name='" + v + "'>", "</voice>");
    } else {
        wrapText("<voice name='" + v + "' rate='" + r + "'>", "</voice>");
    }
});

$("#dlgmaker").click(() => {
    let t = $("#t");
    let tt = t.val();
    let st = tt.substring(t.get(0).selectionStart, t.get(0).selectionEnd);
    if (st.indexOf("<voice ") != -1 || st.indexOf("</voice>") != -1) {
        msgbox("Please do not insert <code>&lt;voice&gt;</code> tags over other <code>&lt;voice&gt;</code> tags.");
        return;
    }
    let stpara = st.split("\n");
    let chara = [];
    if (stpara.length < 2) {
        msgbox("I cannot make a conversation out of less than 2 lines.");
        return;
    } else {
        for (let i = 0; i < stpara.length; i++) {
            if (stpara[i].trim() == "") continue;

            let curCharPos = stpara[i].search(/(:|：)/);
            if (curCharPos == -1) {
                msgbox("<p>The following line does not contain a speaker indicator.</p><p class='p-3 mb-2 bg-light text-dark'>" + stpara[i] + "</p><p>I don't know who speaks it. Please fix this problem first.</p>");
                return;
            } else {
                let curChar = stpara[i].substring(0, curCharPos);
                if (chara.indexOf(curChar) == -1) {
                    chara.push(curChar);
                }
            }
        }
        console.log("DialogMaker: Found characters: " + chara);
        for (let i = 0; i < chara.length; i++) {
            $("#dlgmakerdlg").find("form").append('<div class="form-group row dlgchar"><div class="form-group col-sm-2 charname">' + "👤  " + chara[i] + '</div><div class="form-group col dlgvoicelist1">' + $($("body").find("#voice")[0]).clone().get(0).outerHTML + '</div><div class="form-group col dlgvoicerate1">' + $($("body").find("#speakingrate")[0]).clone().get(0).outerHTML + '</div></div>');
        }
        $("#dlgmakerdlg").find("#speedtxt").toggleClass("col-6");
        $("#dlgmakerdlg").data("chara", chara);
        $("#dlgmakerdlg").modal("show");

    }
});
$("#dlgok1").click(() => {
    let t = $("#t");
    let tt = t.val();
    let st = tt.substring(t.get(0).selectionStart, t.get(0).selectionEnd);
    let stpara = st.split("\n");

    let chara = $("#dlgmakerdlg").data("chara");
    let voices = [];
    let rates = [];

    if (stpara.length < 2) {
        msgbox("I cannot make a conversation out of less than 2 lines.");
        return;
    } else {
        for (let i = 0; i < chara.length; i++) {
            voices.push($($("#dlgmakerdlg").find("#voice")[i]).val());
            rates.push($($("#dlgmakerdlg").find("#speed")[i]).val());
        }
        console.log("DialogMaker: Characters: " + chara + ", Selected voices: " + voices + ", and rates: " + rates);

        for (let i = 0; i < stpara.length; i++) {
            for (let j = 0; j < chara.length; j++) {
                if (stpara[i].substring(0, stpara[i].search(/(:|：)/)) == chara[j]) {
                    stpara[i] = stpara[i].replace(chara[j], "<voice name='" + voices[j] + "' rate='" + rates[j] + "'>");
                    stpara[i] += "</voice>";
                    stpara[i] = stpara[i].replace(/('>)(:|：)/, "$1");
                    break;
                }
            }
        }
        console.log("DialogMaker: Paragraph processed: " + stpara);

        st = stpara.join("\n");
        $("#t").val(tt.substring(0, t.get(0).selectionStart) + st + tt.substring(t.get(0).selectionEnd));
    }
});
$("#dlgmakerdlg").on("hidden.bs.modal", () => {
    $("#dlgmakerdlg").find("form").empty();
    $("#dlgmakerdlg").removeData("chara");
});

$("#insertEmph").click(() => {
    let t = $("#t");
    let tt = t.val();
    let st = tt.substring(t.get(0).selectionStart, t.get(0).selectionEnd);
    if (st.includes("<voice name") || st.includes("</voice>") || st.includes("<repeat ") || st.includes("</repeat>") || st.includes("<emphasis ") || st.includes("</emphasis>")) {
        msgbox("Please do not insert <code>&lt;emphasis&gt;</code> tags over <code>&lt;voice&gt;</code>, <code>&lt;repeat&gt;</code>, or other <code>&lt;emphasis&gt;</code> tags.");
    } else {
        $("#emphasisdlg").modal("show");
    }
});
$("#dlgok2").click(() => {
    let emph = $("#emphlvl").val();
    wrapText("<emphasis level='" + emph + "'>", "</emphasis>");
});

$("#insertProsody").click(() => {
    let t = $("#t");
    let tt = t.val();
    let st = tt.substring(t.get(0).selectionStart, t.get(0).selectionEnd);
    if (st.includes("<repeat ") || st.includes("</repeat>") || st.includes("<prosody ") || st.includes("</prosody>")) {
        msgbox("Please do not insert <code>&lt;prosody&gt;</code> tags over <code>&lt;repeat&gt;</code>, or other <code>&lt;prosody&gt;</code> tags.");
    } else {
        $("#prosodydlg").modal("show");
    }
});
$("#dlgok3").click(() => {
    let rate = $("#rate").val();
    let pitch = $("#pitch").val();
    let tmpStr = "";
    if (Number(rate) != 1) tmpStr += " rate=\"" + rate + "%\"";
    if (Number(pitch) != 0) tmpStr += " pitch=\"" + (Number(pitch) > 0 ? "\+" + pitch : pitch) + "st\"";
    wrapText("<prosody" + tmpStr + ">", "</prosody>");
    $("#dlgcancel3").click();
});
$("#dlgcancel3").click(() => {
    $("#rate").val("100");
    $("#pitch").val("0");
});

$("#insertaudiofiledlg").on("show.bs.modal", function () {
    let s = $(".audios:checked");
    switch (s.val()) {
        case "-1":
            if (s.siblings("#audiofile").val() == "") {
                $("#dlgok5").attr("disabled", "true");
            } else {
                $("#dlgok5").removeAttr("disabled");
            }
            break;
        case "-2":
            if ($("#audiourl").val() == "") {
                $("#dlgok5").attr("disabled", "true");
            } else {
                $("#dlgok5").removeAttr("disabled");
            }
            break;
        default:
            $("#dlgok5").removeAttr("disabled");
            break;
    }
});
$(document).on("click", ".audios", function () {
    let s = $(this).val();
    switch (s) {
        case "-1":
            if ($(this).siblings("#audiofile").val() == "") {
                $("#dlgok5").attr("disabled", "true");
            } else {
                $("#dlgok5").removeAttr("disabled");
            }
            break;
        case "-2":
            if ($("#audiourl").val() == "") {
                $("#dlgok5").attr("disabled", "true");
            } else {
                $("#dlgok5").removeAttr("disabled");
            }
            break;
        default:
            $("#dlgok5").removeAttr("disabled");
            break;
    }
});
$(document).on("change", "#audiofile", () => {
    if ($(".audios:checked").val() == "-1") {
        $("#dlgok5").removeAttr("disabled");
    }
    $("#audios-1").click();
});
$("#audiourl").on("change input", function () {
    if ($(".audios:checked").val() == "-2") {
        if ($(this).val() != "") {
            $("#dlgok5").removeAttr("disabled");
        } else {
            $("#dlgok5").attr("disabled", "true");
        }
    }
    $("#audios-2").click();
});
$("#dlgok5").click(() => {
    let s = $(".audios:checked").val();
    switch (s) {
        case "-1":
            let file = $(".audios:checked").siblings("#audiofile");
            if (file.val() == "") {
                alert("Choose a file, please.");
                return;
            } else {
                let thisfile = file[0].files[0];
                let id = staticAudio.push(URL.createObjectURL(thisfile)) - 1;
                insertText("<audio id=\"" + id + "\" name=\"" + thisfile.name + "\"/> ");
                $("#audiolist").prepend("<p><input type='radio' name='a' id='audios" + id + "' value='" + id + "' class='form-check-input audios'>&nbsp;<label class='form-check-label' for='audios" + id + "'> <strong>#" + id + "</strong>&nbsp;-&nbsp;" + thisfile.name + "&nbsp;&nbsp;&nbsp;<button class=\"btn btn-info\" onclick='previewPlay(staticAudio[" + id + "])'>Play</button></label></p>");
                $(".audios:checked").parents(".filebrowser").hide();
                $(".audios:checked").removeAttr("value");
                $(".audios:checked").attr("id", "audios" + id);
                $(".audios:checked").next("label").attr("id", "audios" + id);
                $(".audios:checked").parents(".filebrowser").after('<div class="filebrowser"><input type="radio" name="a" id="audios-1" value="-1" checked class="form-check-input audios"> <label for="audios-1" class="form-check-label"> Pick a file:</label> <input type="file" id="audiofile" accept="audio/*"></div>');
            }
            break;
        case "-2":
            let url = $("#audiourl").val();
            if (url != "") {
                insertText("<audio src=\"" + url + "\"/>");
            } else {
                alert("Please enter the URL to the audio file.");
                return;
            }
            break;
        default:
            insertText("<audio id=\"" + s + "\"/>");
            break;
    }
});
$("#insertaudiofiledlg").on('hidden.bs.modal', () => {
    $("#previewer")[0].pause();
});

$("#supplyMissingAudio").click(() => {
    let findAudio = new RegExp(/<audio id="([0-9]+)"( name="([\S ][^\/"]+)")*?\/>/gmi);
    let result;
    let ids = [];

    while ((result = findAudio.exec($("#t").val())) != null) {
        if (ids.indexOf(result[1]) == -1) {
            if ($("#missingaudiolist").find(".missingfile[uid='" + result[1] + "']").length <= 0) {
                ids.push(result[1]);
                $("#missingaudiolist").append("<tr><th scope='row'>" + result[1] + "</th><td>" + (result[3] == undefined ? "<span class='font-italic'>Unknown</span>" : result[3]) + "</td><td><input type='file' class='missingfile' uid='" + result[1] + "' accept='audio/*'></td></tr>");
            }
        }
    }
});
$("#dlgok6").click(() => {
    $(".missingfile").each(function (index) {
        if ($(this).parents("tr").css("display") != "none") {
            if ($(this).val() != "") {
                let thisfile = $(this)[0].files[0];
                staticAudio[Number($(this).attr("uid"))] = URL.createObjectURL(thisfile);
                $("#audiolist").prepend("<p><input type='radio' name='a' id='audios" + $(this).attr("uid") + "' value='" + $(this).attr("uid") + "' class='form-check-input audios'>&nbsp;<label class='form-check-label' for='audios" + $(this).attr("uid") + "'> <strong>#" + id + "</strong>&nbsp;-&nbsp;" + thisfile.name + "  <button class=\"btn btn-info\" onclick='previewPlay(staticAudio[" + $(this).attr("uid") + "])'>Play</button></label></p>");
                $(this).parents("tr").hide();
            } else {
                $(this).parents("tr").remove();
            }
        }
    });
});

$("#inputfilenamedlg").on("shown.bs.modal", () => {
    let t = $("#filename");
    t.val(new Date().getTime().toString());
    t.focus();
    t.select();
});
$("#dlgok9").click(() => {
    let filename = $("#filename").val();
    $("#saveit").attr("disabled", "true");  //saveit button state change
    saveAudio(filename);
});
$("#inputfilenamedlg").find("#filename").keypress((event) => {
    if (event.which == 13) {
        event.preventDefault();
        $("#dlgok9").click();
    }
});
$("#inputfilenamedlg").find("#filename").on("input change", () => {
    if ($("#inputfilenamedlg").find("#filename").val() == "") {
        $("#dlgok9").attr("disabled", "true");
    } else {
        $("#dlgok9").removeAttr("disabled");
    }
});
