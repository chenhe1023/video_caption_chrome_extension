
var React = require('react');
var ReactDOM = require('react-dom');
var CaptionUtil = require("./caption.js");

require("../public/jquery.mousewheel.min.js")

var CaptionBox = React.createClass({
    getInitialState: function () {
        // Get initial state from properties
        return { caption: this.props.caption };
    },
    getComments: function () {
        var commentClass = function (comment) {
            var className = "comment";
            if (comment.user.type == 500)
                className += " instructor-comment";
        };
        var comments = [];
        for (var i = 0; i < this.state.caption.comments.length; i++) {
            var c = this.state.caption.comments[i];
            comments.push(<div key={c.id} className={commentClass(c) }>
                <span className="comment comment-username">{c.user.email}</span>
                c.text
                <p className="comment-time">- {c.created_at}</p>
            </div>);
        }
        return comments;
    },
    getIcons: function () {
        var that = this;
        var inaccessibleClass = function () {
            var className = "icon-count inaccessible-count with-tooptip";
            if (that.state.caption.inaccessibles.length) className += " active ";
            if (that.state.caption.selfInaccessible) className += "self-active";
            return className;
        }

        var bookmarkClass = function () {
            var className = "icon-count bookmark-count with-tooptip";
            if (that.state.caption.bookmarks.length) className += " active ";
            if (that.state.caption.selfBookmark) className += "self-active";
            return className;
        }

        var questionClass = function () {
            var className = "icon-count question-count with-tooptip";
            if (that.state.caption.questions.length) className += " active ";
            if (that.state.caption.selfQuestion) className += "self-active";
            return className;
        }


        return (<div className="icon-count-container">
            <div className={inaccessibleClass() } data-toggle="tooltip" data-placement="bottom" title="" data-original-title="report caption error">
                <span className="inaccessible-count-number icon-count-number">{this.state.caption.inaccessibles.length}</span>
            </div>
            <div className={bookmarkClass() } data-toggle="tooltip" data-placement="bottom" title="" data-original-title="add a bookmark">
                <span className="bookmark-count-number icon-count-number">{this.state.caption.bookmarks.length}</span>
            </div>
            <div className={questionClass() } data-toggle="tooltip" data-placement="bottom" title="" data-original-title="ask for help">
                <span className="question-count-number icon-count-number">{this.state.caption.questions.length}</span>
            </div>
        </div>);
    },
    render: function () {
        return (
            <div className="caption" id={this.state.caption.id}>

                <div className="row caption-header">
                    <div className="time-label-wrapper">
                        <span className="time-label">{this.state.caption.startHuman}-{this.state.caption.endHuman}</span>
                        <span className="time-control-btn play-btn glyphicon glyphicon-play" aria-hidden="true"></span>
                        <span className="time-control-btn loop-btn glyphicon glyphicon-repeat" aria-hidden="true"></span>
                    </div>
                    {this.getIcons() }
                </div>
                <div className="caption-body row">
                    <div className="col-sm-6 correction-wrapper">
                        <div className="correction-input-wrapper">
                            <span className="textarea-label approved">Approved Caption</span>
                            <div>
                                <textarea className="write write-correction" row="3" placeholder="Write the correct caption.." defaultValue={this.state.caption.correction} />
                            </div>
                            <i className="updated fa fa-check-circle-o"></i>
                            <div>
                                <button className="submit-correction-btn btn btn-success btn-sm hidden" type="button">
                                    <span className="glyphicon glyphicon-ok hidden" aria-hidden="true" ></span>submit
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6 comment-wrapper">
                        <span className="textarea-label">Comment</span>
                        <div>
                            <textarea className="write write-comment" placeholder="Write a comment..." row="1"></textarea>
                        </div>
                        <i className="updated fa fa-check-circle-o"></i>
                        <div>
                            <button className="submit-comment-btn btn btn-success btn-sm hidden" type="button">
                                <span className="glyphicon glyphicon-ok hidden" aria-hidden="true" ></span>submit
                            </button>
                        </div>
                        <hr className="comment-splitter" />
                        <div className="comments">
                            {this.getComments() }
                        </div>
                    </div>

                    <div className="caption-footer">
                    </div>
                </div>
            </div>
        );
    }
});

var Captions = React.createClass({
    componentWillUpdate: function (nextProps, nextState) {
        //console.log(nextProps.  )
        if (nextState.currentCaptionId != this.state.currentCaptionId) {
            var caption = this.state.captionMapping[nextState.currentCaptionId][0];
            var component = this.state.captionMapping[nextState.currentCaptionId][1];
            CaptionUtil.scrollTo($("#" + caption.id));
        }
    },
    getInitialState: function () {
        return { captions: [], captionMapping: {}, currentCaptionId: 0 };
    },
    captionBlocks: function () {
        var blocks = [];
        for (var i = 0; i < this.state.captions.length; i++) {
            var captionComponent = <CaptionBox key={this.state.captions[i].number}  caption={this.state.captions[i]} />;
            this.state.captionMapping[this.state.captions[i].id] = [this.state.captions[i], captionComponent];
            blocks.push(captionComponent);
        }
        if (this.state.captions.length && !this.state.currentCaptionId) {
            this.state.currentCaptionId = this.state.captions[0].id;
        }
        return blocks;
    },
    componentDidMount: function () {
        var that = this;
        CaptionUtil.getCaptions("EkWfwRPyTG8").then(function (response) {
            that.setState({ captions: response });
        });

        $(".comments").mousewheel(function (event, delta) {
            event.preventDefault();
        });
        $("#captions").mousewheel(function (event, delta) {
            var $comment;
            if ($(event.toElement).closest('.comments-display').length) {
                $comment = $(event.toElement).closest('.comments-display');
            }
            else if ($(event.toElement).is('.comments-display')) {
                $comment = $(event.toElement);
            }
            if ($comment == null || !$comment.get(0).scrollHeight || $comment.get(0).scrollHeight <= $comment.height()) {
                this.scrollLeft -= (delta * 70);
                event.preventDefault();
            }
        });
        //$("#caption-container").draggable();
    },
    render: function () {
        return (
            <div id="caption-container">
                <a className="caption-control-arrow caption-control-arrow-left">
                    <span className="glyphicon glyphicon-chevron-left"></span>
                </a>
                <a className="caption-control-arrow caption-control-arrow-right">
                    <span className="glyphicon glyphicon-chevron-right"></span>
                </a>
                <div id="captions">
                    <div>
                        {this.captionBlocks() }
                    </div>
                </div>
            </div>
        );
    }
});



var captionsComponent = <Captions />;
captionsComponent = ReactDOM.render(
    captionsComponent,
    document.getElementById('application')
)


window.addEventListener("message", function (event) {
    if (event.data.application == "video_caption" && event.data.type == "SYNC_EDITOR") {
        //var syncData = JSONevent.data.message);
        // Sync the editor based on the time information from content script
        var syncData = event.data.message;

        if (captionsComponent.state.captionMapping) {
            var currentCaption = captionsComponent.state.captionMapping[captionsComponent.state.currentCaptionId][0];
            if (syncData.time < currentCaption.end && syncData.time >= currentCaption.start) {
                return;
            }
        }
        for (var key in captionsComponent.state.captionMapping) {
            var caption = captionsComponent.state.captionMapping[key][0];
            var component = captionsComponent.state.captionMapping[key][1];
            if (syncData.time < caption.end && syncData.time >= caption.start) {
                console.log(caption.id);
                //captionsComponent.state.currentCaptionId = caption.id;
                captionsComponent.setState({ currentCaptionId: caption.id });

                return;
            }
        }
    }
});