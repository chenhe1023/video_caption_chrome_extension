captions = [];
currentCaption = null;
function gup(name, url) {
    if (!url) url = location.href;
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(url);
    return results == null ? null : results[1];
}
//gup('q', 'hxxp://example.com/?q=abc')

var showUI = function () {
    $("#" + chrome.runtime.id).velocity({ width: 340, height: 400 }, 250);
    $("#" + chrome.runtime.id)[0].dataset.shown = true;

}

var hideUI = function () {
    $("#" + chrome.runtime.id).velocity({ width: 0, height: 0 }, 250);
    $("#" + chrome.runtime.id)[0].dataset.shown = false;
}

var isVideoPage = function () { return $("video").length; }

var getVideoInfo = function () {
    var videoId = gup("v", window.location.href);
    var videoTitle = $("#eow-title").text();
    return {
        id: videoId,
        title: videoTitle
    };
}

window.addEventListener("message", function (event) {
    var origin = event.origin || event.originalEvent.origin; // For Chrome, the origin property is in the event.originalEvent object.
    var frame = document.getElementById(chrome.runtime.id);

    if (event.data.application != 'video_caption')
        return;

    console.log("Content script received: " + event.data.type);
    if (event.data.type == "UI_HIDE") {
        hideUI();
    }
    else if (event.data.type == "UI_SHOW") {
        showUI();
    }
    else if (event.data.type == "UI_READY") {
        console.log("Content script received: " + event.data.type);
        if (!isVideoPage())
            frame.contentWindow.postMessage({ application: 'video_caption', type: "UI_INIT", success: false, message: 'This page does not contain a video.' }, "*");
        else {
            var videoInfo = getVideoInfo();
            $.get("https://datascience.ischool.syr.edu/api/caption?hash=" + videoInfo.id).done(function (response) {
                captions = JSON.parse(response);
                videoInfo.captionLength = captions.length;
                frame.contentWindow.postMessage(
                    {
                        application: 'video_caption',
                        type: "UI_INIT",
                        success: true,
                        message: JSON.stringify(videoInfo)
                    },
                    "*");
            });
        }
    }
    else if(event.data.type == "LOAD_CAPTION"){
        var $caption = $("<p>123123123123</p>");
        $caption.css("position", "absolute");
        $caption.css("bottom", "45px");
        $caption.css("width", "100%");
        $caption.css('z-index', '10000');
        $caption.css("text-align", 'center');
        $caption.css('font-size', '22px');
        $(".html5-video-player").append($caption);
        var video = $("video")[0];
        setInterval(function(){
            var time = video.currentTime * 1000 ;
            if(currentCaption && time < currentCaption.end && time >= currentCaption.start)
                return;
            else{
                for(var i = 0 ; i < captions.length; i++){
                    var c = captions[i];
                    if(time < c.end && time >= c.start){
                        currentCaption = c;
                        $caption.text(c.text);
                        return;
                    }
                }
            }
        }, 300);
        
    }
}, false);


