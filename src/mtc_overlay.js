/*!
* mtcOverlay - A jQuery plugin for responsive overlay windows
* Version: 1.1
* Author: Andrew Morgan, Paul McAvoy, Aaron Spence, Valdis Ceirans
*/

;(function ($, window, document) {

    'use strict';

    // Create the defaults once
    var plugin_name = 'mtcOverlay',
        plugin;

    // The actual plugin constructor
    function Plugin(element, options) {

        // define plugin as self
        plugin = this;
        // p;ugin caller element
        plugin.element = element;
        plugin.$this = $(plugin.element);
        // default settings, see wiki
        plugin.defaults = {
            // use this to change the markup of the close button
            button_html: '<div class="overlayCloseButton"><a href="#">Close <i class="fa fa-remove"></i></a></div>',
            // add custom class to wrap so you can change padding or whatever via CSS
            content_class: '',
            // set to true to activate gallery functionality. Don't forget to set data-rel for items
            gallery: false,
            // gallery previous button markup. Must have js_galleryNext class.
            gallery_prev_html: '<button class="js_galleryPrev galleryPrev"><i class="fa fa-angle-left"></i></button>',
            // gallery next button markup. Must have js_galleryNext class.
            gallery_next_html: '<button class="js_galleryNext galleryNext"><i class="fa fa-angle-right"></i></button>',
            // overlay video settings
            video_settings: {
                autoplay: false,
                width: 500,
                height: 284
            },
            // iframe dimensions
            iframe_settings: {
                width: 500,
                height: 284
            },
            fullscreen_iframe: false,
            // vertical gap between overlay box and window
            margin_vertical: 20,
            // horizontal gap between overlay box and window
            margin_horizontal: 40,
            // max width of the popup
            max_width: 1024,
            // overlay fade time in ms
            fade_time: 300,
            // sets if the perfectScroll plugin will be applied for the overlay scrollbar. This only matters for ajax popups since gallery and video will always be smaller or equal to window size.
            perfect_scroll: true,
            // this option allows to turn off perfect scroll on touch devices. Useful for the galleries with ajax content - if perfect scrollbar is used then it will absorb all the events, and swipe won't work.
            disable_perfect_scroll_on_touch: true,
            // site outer wrapper selector(one that's ONLY direct child of body). This is used for saving and restoring the scroll position on overlay open.
            site_wrapper: '.siteWrapper',
            // if set true allows to switch gallery with keyboard arrows
            arrow_controls: true,
            // allows closing overlay with 'Escape' button.
            close_on_esc: true,
            // allows changing gallery with swipe gesture on touchscreens.
            swipe: true,
            // if set true then content from same page (when using no-ajax) will be moved into overlay instead of copying it.
            // useful when you have forms with checkboxes and radios in popup - setting this to true solves issue with duplicate ids
            inline: true,
            // for opening programmatically
            target: '',
            no_ajax: false,
            video: false,
            iframe: false,
            overlay_click_close: true,
            image: false,
            // responsive settings
            responsive: [
                {
                    breakpoint: 640,
                    settings: {
                        margin_vertical: 10,
                        margin_horizontal: 10
                    }
                }
            ],
            beforeOpen: function () {},
            onOpen: function () {},
            onClose: function () {},
            afterGalleryChange: function () {},
            beforeGalleryChange: function () {}
        };
        plugin.all_settings = $.extend(true, {}, plugin.defaults, options);
        plugin.settings = null;
        plugin._defaults = plugin.defaults;
        plugin._name = plugin_name;
        // gallery loading flag
        plugin.gallery_loading = false;
        // active element for gallery
        plugin.active_element = null;
        // url variable, set later on
        plugin.url = null,

            plugin.init();

    }

    Plugin.prototype = {
        //prepare the responsive array
        readResponsive: function () {

            var previous_breakpoints_settings = plugin.all_settings;

            if (plugin.all_settings.responsive) {

                // loop through responsive settings
                $.each(plugin.all_settings.responsive, function (i, value) {
                    //extend breakpoints settings to include ones from previous
                    value.settings = $.extend(true, {}, previous_breakpoints_settings, value.settings);
                    // get rid of responsive duplicate
                    delete value.settings.responsive;
                    // previous now become the current ones
                    previous_breakpoints_settings = value.settings;
                });

            }
        },

        checkResponsive: function () {

            var window_width = $('.overlayBoxOuter').width();

            // set the default as tablet
            plugin.settings = plugin.all_settings;
            // iterate through settings and find the right one
            if (plugin.all_settings.responsive) {

                // loop through responsive settings
                $.each(plugin.all_settings.responsive, function (i, value) {
                    // find one that is active
                    if (matchesMediaQuery(0, value.breakpoint)) {
                        plugin.settings = value.settings;
                    }
                });
            }

        },

        calculateDimensions: function () {

            var window_height = $('.overlayBoxOuter').height(),
                content_width = $('.overlayBox .overlayContent').width(),
                content_height = $('.overlayBox .overlayContent').height(),
                outer_height = $('.overlayBox').outerHeight(),
                desired_width = 0,
                // target height is window height minus margin minus height that is not image/iframe
                desired_height = window_height - 2 * plugin.settings.margin_vertical - (outer_height - content_height);

            $('.overlayBox').css({
                width: 'auto'
            });

            if (content_height > 0) {
                desired_width =  Math.floor(content_width / content_height * desired_height);
                $('.overlayBox').width(desired_width);
            }

        },

        resize: function () {

            // if window is resized then reposition the overlay box
            var overlay_box_top = plugin.settings.margin_vertical,
                overlay_box_left = plugin.settings.margin_horizontal,
                overlay_box_right = plugin.settings.margin_horizontal,
                window_height = $(window).height(),
                content_width;

            // reset all
            $('.overlayBox .overlayContent').css({
                width: '100%',
            });

            $('.overlayBox').css({
                width: 'auto',
                top: overlay_box_top,
                left: overlay_box_left,
                right: overlay_box_right,
                bottom: 'auto',
            });

            // if image then max width is either max_width or image width
            if ($('.overlayImage').length) {
                content_width = Math.min(plugin.settings.max_width, $('.overlayContentInner > img').width());
            } else {
                content_width = Math.min($('.overlayBoxOuter').width() - 2 * plugin.settings.margin_horizontal, plugin.settings.max_width);
            }

            // set the width to defult
            $('.overlayBox').width(content_width);

            // scale and reposition vertically if needed
            if (window_height - 2 * plugin.settings.margin_vertical > $('.overlayBox').outerHeight()) {
                overlay_box_top = ($('.overlayBoxOuter').height() - $('.overlayBox').outerHeight()) / 2;
            } else {
                // calculate and set width to fit vertically if image or video iframe
                if ($('.overlayBox .overlayVideo').length > 0 || $('.overlayBox .overlayImage').length > 0) {
                    plugin.calculateDimensions();
                }

            }

            // scale and reposition horizontally if needed
            if ($('.overlayBoxOuter').width() - 2 * plugin.settings.margin_horizontal >= $('.overlayBox').outerWidth()) {
                overlay_box_left = Math.floor(($('.overlayBoxOuter').width() - $('.overlayBox').outerWidth()) / 2);
            }

            // if ajax content that is taller than page add bottom margin
            if ($('.overlayBox').outerHeight() > window_height - 2 * plugin.settings.margin_vertical || plugin.settings.fullscreen_iframe) {

                $('.overlayBox').css({
                    bottom: plugin.settings.margin_vertical,
                    top: plugin.settings.margin_vertical,
                    left: overlay_box_left,
                    right: overlay_box_right
                });

            } else {

                $('.overlayBox').css({
                    left: overlay_box_left,
                    top: overlay_box_top,
                    right: overlay_box_right
                });

            }

            if (plugin.settings.perfect_scroll && $('.overlayContent .ps-scrollbar-y').length > 0) {
                $('.overlayContentInner').perfectScrollbar('update');
            }
        },

        imageMode: function (callback) {

            var src = plugin.url,
                image = $('<img/>');


            $('.overlayContentInner').addClass('overlayImage');

            image.on('load', function () {
                $('.overlayBox .overlayImage').append(image);
                callback();
                plugin.resize();
                plugin.imageUrl();
            });

            image.attr({
                src: src
            });

            plugin.imageTitle();
        },

        displayOverlay: function () {

            // add close button to overlay
            $('.overlayBox').append($(plugin.settings.button_html));

            // add any custom classes
            if (plugin.settings.content_class !== '') {
                $('.overlayBox').addClass(plugin.settings.content_class);
            }

            // remove overlayLoading class
            $('.overlayBoxOuter').removeClass('overlayLoading');

            // provide callback functionality before open of overlay and resize
            plugin.settings.beforeOpen();

            // reposition overlay
            plugin.resize();

            // fade in overlay
            $('.overlayBox').animate({
                opacity: 1
            }, function () {
                // provide callback functionality on open of overlay
                plugin.settings.onOpen();

                if (plugin.settings.perfect_scroll && $('.overlayContentInner .ps-scrollbar-y').length > 0) {
                    $('.overlayContentInner').perfectScrollbar('update');
                }
            });

            // Close overlay on click of close button
            $('.overlayCloseButton').on('click', function (e) {
                e.preventDefault();
                plugin.overlayClose();
            });

            $(window).on('resize.overlay', function () {
                plugin.checkResponsive();
                plugin.resize();
            });

            $(window).on('orientationchange.overlay', function () {
                plugin.checkResponsive();
                plugin.resize();
            });

        },

        ajaxImagesLoaded: function (callback) {

            var images = $('.overlayAjax img'),
                promises = [];

            $.each(images, function (i, el) {
                var img = new Image();

                promises[i] = $.Deferred();

                img.onload = function () {
                    promises[i].resolve();
                };

                img.onerror = function () {
                    promises[i].resolve();
                };

                img.src = $(el).prop('src');
            });

            $.when.apply($, promises).done(function () {
                callback();
            });

        },

        // function to display the box
        ajaxResponse: function (callback)  {

            // set some vars
            var html = '',
                data_filter = plugin.$this.attr('data-filter');

            // do ajax
            $.ajax({
                type: 'post',
                url: plugin.url,
                dataType: 'html',
                success: function (response) {

                    // check if ajaxing whole page or section of page
                    if (data_filter === undefined) {
                        html = response;
                    } else {
                        html = $(data_filter, response).html();
                    }

                    // add html to page
                    $('.overlayContentInner').addClass('overlayAjax').html('').append('<div></div>').find('> div').html(html);

                    if (plugin.settings.fullscreen_iframe) {
                        $('.overlayBox').addClass('overlayFullscreen');
                    }

                    plugin.ajaxImagesLoaded(function () {
                        if (plugin.settings.perfect_scroll) {
                            //if not touch device and enabled on touch
                            if (!($('html').hasClass('touchevents') && plugin.settings.disable_perfect_scroll_on_touch)) {
                                $('.overlayContentInner').perfectScrollbar();
                            }
                        }

                        callback();
                        plugin.resize();
                    });

                }
            });

            plugin.imageTitle();

        },

        // function to display the box from same page
        showBlock: function (callback)  {

            // set some vars
            var html = '',
                target_element,
                overlay_content;

            // get element to display
            target_element = $(plugin.url);

            if (target_element.length > 0) {
                html = target_element.children();
            }

            // add html to page
            overlay_content = $('.overlayContentInner').addClass('overlayAjax').html('').append('<div></div>').find('> div');

            //if inline then move content, if not copy
            if (plugin.settings.inline) {
                // move content from page to overlay
                html.appendTo(overlay_content);

                // mark the place where to restore the content
                target_element.addClass('js_restoreOverlayContent');
            } else {
                html.clone().appendTo(overlay_content);
            }

            if (plugin.settings.fullscreen_iframe) {
                $('.overlayBox').addClass('overlayFullscreen');
            }

            plugin.imageTitle();

            plugin.ajaxImagesLoaded(function () {
                if (plugin.settings.perfect_scroll) {
                    //if not touch device and enabled on touch
                    if (!($('html').hasClass('touchevents') && plugin.settings.disable_perfect_scroll_on_touch)) {
                        $('.overlayContentInner').perfectScrollbar();
                    }
                }

                callback();
                plugin.resize();
            });

        },

        // moves content back from overlay to page
        restoreOverlayContent: function () {

            var overlay_content = $('.overlayAjax > div').children(),
                content_place = $('.js_restoreOverlayContent');

            if (plugin.settings.inline && content_place.length > 0) {
                overlay_content.appendTo(content_place);
                content_place.removeClass('js_restoreOverlayContent');
            }
        },

        // adds image title
        imageTitle: function () {

            var image_title = plugin.active_element.data('title');

            $('.overlayBox').addClass('hasTitle');

            // add title/alt if it exists
            if (image_title !== '' && image_title !== undefined) {

                if ($('.overlayBox .overlayBoxTitle').length > 0) {
                    $('.overlayBox .overlayBoxTitle').html(image_title);
                } else {
                    $('.overlayBox').append('<span class="overlayBoxTitle">' + image_title + '</span>');
                }
            } else {
                $('.overlayBox .overlayBoxTitle').remove();
                $('.overlayBox').removeClass('hasTitle');
            }

        },

        // adds link to overlay
        imageUrl: function () {

            var image_url = plugin.active_element.data('url'),
                url_html = '<a class="overlayBoxLink" href="' + image_url +'" target="_blank"></a>';

            $('.overlayBox').addClass('hasLink');

            // add href to overlayBox if it exists
            if (image_url !== '' && image_url !== undefined) {
                if ($('.overlayBoxLink').length) {
                    $('.overlayBoxLink').attr({
                        src: image_url
                    });
                } else {
                    $(url_html).insertAfter('.overlayBox .overlayImage img');
                }
            } else {
                $('.overlayBoxLink').remove();
                $('.overlayBox').removeClass('hasLink');
            }

        },

        gallery: function (rel) {
            //get all gallery elements
            var gallery_images = $('[data-rel="' + plugin.active_element.data('rel') + '"]');

            // build gallery
            $('.overlayBox').addClass('hasGallery');
            $('.overlayBox').append(plugin.settings.gallery_prev_html);
            $('.overlayBox').append(plugin.settings.gallery_next_html);

            plugin.galleryButtons(gallery_images.index(plugin.active_element), gallery_images.length - 1);

            plugin.gallery_element = plugin.$this;

            // next and previous clicks
            $('body').on('click.gallery', '.overlayBox .js_galleryPrev, .overlayBox .js_galleryNext', function () {
                var active_element_nr = $(this).data('index'),
                    overlay_content = $('.overlayBox .overlayContent');

                plugin.active_element = gallery_images.eq(active_element_nr);

                plugin.url = plugin.active_element.attr('href');

                // if valid index
                if (active_element_nr < 0 || active_element_nr > gallery_images.length - 1) {
                    return void 0;
                }

                // if loading do nothing
                if (plugin.gallery_loading) {
                    return void 0;
                } else {
                    plugin.gallery_loading = true;
                }

                // fix the dimensions
                $('.overlayBox .overlayContent').width($('.overlayBox .overlayContent').width());
                $('.overlayBox .overlayContent').height($('.overlayBox .overlayContent').height());

                plugin.settings.beforeGalleryChange();

                // fade out existing
                $('.overlayBox .overlayContent .overlayContentInner').fadeOut(plugin.settings.fade_time, function () {

                    // destroy perfect scrollbar
                    if (plugin.settings.perfect_scroll && $('.overlayContentInner .ps-scrollbar-y').length > 0) {
                        $('.overlayContentInner').perfectScrollbar('destroy');
                    }
                    // restore content back to page
                    plugin.restoreOverlayContent();

                    // remove previous content
                    overlay_content.find('.overlayContentInner').remove();
                    overlay_content.prepend('<div class="overlayContentInner"></div>');

                    overlay_content.addClass('overlayContentLoading');

                    plugin.switchGalleryMode(function () {
                        $('.overlayContentInner').hide();
                        overlay_content.removeClass('overlayContentLoading');
                        $('.overlayContentInner').fadeIn(plugin.settings.fade_time, function () {
                            plugin.settings.afterGalleryChange();
                        });
                        plugin.gallery_loading = false;
                        //remove fixed dimensions and resize
                        overlay_content.removeAttr('style');
                    });

                    plugin.galleryButtons(active_element_nr, gallery_images.length - 1);
                });

            });

            if (plugin.settings.arrow_controls) {

                $(document).on('keydown.gallery', function (e) {
                    var key;

                    if (e.charCode) {
                        key = e.charCode;
                    } else if (e.keyCode) {
                        key = e.keyCode;
                    } else {
                        key = 0;
                    }
                    // left arrow
                    if (key === 37 && $('.overlayBox .js_galleryPrev').is(':visible')) {
                        $('.overlayBox .js_galleryPrev').trigger('click');
                        // right arrow
                    } else if (key === 39 && $('.overlayBox .js_galleryNext').is(':visible')) {
                        $('.overlayBox .js_galleryNext').trigger('click');
                    }
                });
            }

            if (plugin.settings.swipe) {
                $('body').on('swipeleft.gallery', '.overlayContent', function (e) {
                    $('.overlayBox .js_galleryNext').trigger('click');
                });

                $('body').on('swiperight.gallery', '.overlayContent', function (e) {
                    $('.overlayBox .js_galleryPrev').trigger('click');
                });
            }

            // add gallery content
            plugin.switchGalleryMode(plugin.displayOverlay);

        },

        switchGalleryMode: function (callback) {

            // if next element is video
            if (plugin.active_element.data('video')) {
                plugin.videoMode(callback);
            } else if (plugin.active_element.data('iframe')) {
                plugin.iframeMode(callback);
                // if ajax content
            } else if (plugin.active_element.data('ajax')) {
                plugin.ajaxResponse(callback);
            } else if (plugin.active_element.data('no-ajax')) {
                plugin.showBlock(callback);
                // if next element is image
            } else {
                plugin.imageMode(callback);
            }
        },

        galleryButtons: function (activeIndex, max) {

            var gallery_prev_el = $('.overlayBox .js_galleryPrev'),
                gallery_next_el = $('.overlayBox .js_galleryNext');

            if (activeIndex > 0) {
                gallery_prev_el.removeClass('arrowInactive');
            } else {
                gallery_prev_el.addClass('arrowInactive');
            }

            if (activeIndex < max) {
                gallery_next_el.removeClass('arrowInactive');
            } else {
                gallery_next_el.addClass('arrowInactive');
            }

            gallery_prev_el.data('index', activeIndex - 1);
            gallery_next_el.data('index', activeIndex + 1);

        },

        initFrameDimensions: function () {

            if( $(".overlayVideo iframe").length ) {
                var element = $(".overlayVideo iframe");
            } else if( $(".overlayVideo video").length ) {
                var element = $(".overlayVideo video");
            }

            var element_ratio = 100 * element.attr('height') / element.attr('width');

            $(".overlayVideo").css({
                height: '0',
                width: '100%',
                paddingTop: element_ratio + '%'
            });

            element.css({
                width: '100%',
                height: '100%'
            });

        },

        videoMode: function (callback) {

            var autoplay = '',
                html5_video_autoplay = '',
                videoid = '',
                src = '',
                can_initialize = false,
                rel = '?rel=0';

            // autoplay
            if (plugin.settings.video_settings.autoplay === true) {
                autoplay = '?autoplay=1';
                html5_video_autoplay = 'autoplay';
                rel = '&rel=0';

            }

            // lets iframe in the video
            if (plugin.url.toLowerCase().indexOf("youtu") >= 0) {
                videoid = plugin.url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
                src = '<iframe src="//www.youtube.com/embed/' + videoid[1] + autoplay + rel + '" width="' + plugin.settings.video_settings.width +'" height="' + plugin.settings.video_settings.height +'" frameborder="0" allowfullscreen allow="autoplay"></iframe>';
                can_initialize = true;
            } else if (plugin.url.toLowerCase().indexOf("vimeo") >= 0) {
                videoid = plugin.url.match(/https?:\/\/(www\.)?vimeo.com\/(\d+)($|\/)/);
                src = '<iframe src="//player.vimeo.com/video/' + videoid[2] + autoplay + '" width="' + plugin.settings.video_settings.width +'" height="' + plugin.settings.video_settings.height +'" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen allow="autoplay"></iframe>';
                can_initialize = true;
            } else if (plugin.url.toLowerCase().indexOf("mp4") >= 0) {
                src = '<video controls="" width="' + plugin.settings.video_settings.width + '" height="' + plugin.settings.video_settings.height +'" poster="' + plugin.active_element.data('poster') + '" ' + html5_video_autoplay + '>' + '<source src="' + plugin.url + '" type="video/mp4" allow="autoplay">'+ 'Your browser does not support HTML5 video.' + '</video>';
                can_initialize = true;
            }

            if (can_initialize === true) {
                $('.overlayContentInner').addClass('overlayVideo');
                $('.overlayVideo').html(src);
            }

            plugin.initFrameDimensions();
            plugin.imageTitle();
            callback();
            plugin.resize();
            
        },

        iframeMode: function (callback) {

            $('.overlayContentInner').addClass('overlayVideo');
            $('.overlayVideo').html('<iframe src="' + plugin.url + '" width="' + plugin.settings.iframe_settings.width +'" height="' + plugin.settings.iframe_settings.height + '"></iframe>');

            if (plugin.settings.fullscreen_iframe) {
                $('.overlayBox').addClass('overlayFullscreen');
            }

            plugin.initFrameDimensions();
            plugin.imageTitle();
            callback();
            plugin.resize();

        },

        overlayOpen: function () {

            var rel = plugin.$this.data('rel'),
                show_video = plugin.$this.data('video'),
                show_iframe = plugin.$this.data('iframe'),
                no_ajax = plugin.$this.data('no-ajax'),
                show_image = false,
                extension,
                extensions = [
                    'jpg',
                    'jpeg',
                    'png',
                    'gif'
                ],
                scroll_on_open;

            // set active element as caller
            plugin.active_element = plugin.$this;

            plugin.url = plugin.$this.attr('href');

            // if opening programmatically override url and set
            if (plugin.settings.target.length > 0) {
                plugin.url = plugin.settings.target;
            }

            // get extension of url/image before query string
            extension = plugin.url.split('?')[0].split('.').pop().toLowerCase();

            // if allowed image extension
            if ($.inArray(extension, extensions) > -1) {
                show_image = true;
            }

            // if opening programmatically
            if (plugin.settings.target.length > 0) {
                // if from same page
                if (plugin.settings.no_ajax === true) {
                    no_ajax = true
                }
                // if video
                if (plugin.settings.video === true) {
                    show_video = true
                }
                // if iframe
                if (plugin.settings.iframe === true) {
                    show_iframe = true
                }
                // if image
                if (plugin.settings.image === true) {
                    show_image = true
                }
            }

            // store scroll position
            scroll_on_open = $('body').scrollTop() || $('html').scrollTop();

            $('body').data('stored-scroll', scroll_on_open);

            $(plugin.settings.site_wrapper).css({
                position: 'relative',
                top: -scroll_on_open
            });

            $('body, html').scrollTop(0);

            // append overlay background and container to body
            $('html').addClass('noScroll blur');

            $('body').append('<div class="overlayBoxOuter"><div class="overlayBox"><div class="overlayContent"><div class="overlayContentInner"></div></div></div>');

            // add loading class
            $('.overlayBoxOuter').addClass('overlayLoading');

            // Close overlay when background is clicked
            if (plugin.settings.overlay_click_close) {
                $('.overlayBoxOuter').on('click', function (e) {
                    if (e.target === this) {
                        plugin.overlayClose();
                    }
                });
            }

            //close on escape
            if (plugin.settings.close_on_esc) {

                $(document).on('keydown.overlay', function (e) {
                    var key;

                    if (e.charCode) {
                        key = e.charCode;
                    } else if (e.keyCode) {
                        key = e.keyCode;
                    } else {
                        key = 0;
                    }
                    if (key === 27) {
                        plugin.overlayClose();
                    }
                });
            }

            // if gallery load gallery
            if (rel && $('[data-rel="' + rel + '"]').length > 1 && plugin.settings.gallery === true) {
                plugin.gallery();
            } else {
                // if extention is in array then we have to grab an image and not ajax
                if (show_image) {
                    plugin.imageMode(plugin.displayOverlay);
                // video? lets insert it
                } else if (show_video === true) {
                    plugin.videoMode(plugin.displayOverlay);
                // iframe mode
                } else if (show_iframe === true) {
                    plugin.iframeMode(plugin.displayOverlay);
                } else {
                    // show block from same page
                    if (no_ajax === true) {
                        plugin.showBlock(plugin.displayOverlay);
                    // or load from url
                    } else {
                        plugin.ajaxResponse(plugin.displayOverlay);
                    }
                }
            }

            $('.bgCover').css({
                opacity: 0
            }).animate({
                opacity: 1
            });

        },

        overlayClose: function () {

            plugin.settings.onClose();

            if (plugin.settings.perfect_scroll && $('.overlayBox .ps-container').length > 0) {
                $('.overlayContentInner').perfectScrollbar('destroy');
            }

            $('body').off('click.gallery');

            $('body').off('swipeleft.gallery');

            $('body').off('swiperight.gallery');

            $(document).off('keydown.gallery');

            $(document).off('keydown.overlay');

            $('html').removeClass('noScroll blur');

            plugin.restoreOverlayContent();

            $('.overlayBoxOuter').animate({
                opacity: 0
            }, 300, function () {
                plugin.destroy();
            });

        },

        destroy: function () {

            // remove some elements from the DOM
            $('.overlayCloseButton').remove();
            $('.overlayBoxOuter').remove();

            $(plugin.settings.site_wrapper).css({
                top: 0
            });

            $('body, html').scrollTop($('body').data('stored-scroll'));

            // remove plugin data from trigger
            plugin.$this.removeData('plugin_' + plugin_name);

            $(window).off('resize.overlay');
            $(window).off('orientationchange.overlay');

        },

        init: function () {

            plugin.readResponsive();
            plugin.checkResponsive();
            plugin.overlayOpen();

        }

    };

    $.fn[plugin_name] = function (options) {
        return this.on('click', function (e) {

            e.preventDefault();
            var plugin, _name;
            plugin = $.data(this, 'plugin_' + plugin_name);
            if (typeof options === 'string') {
                if (plugin !== null) {
                    if (typeof plugin[_name = options] === 'function') {
                        return plugin[_name]();
                    } else {
                        return void 0;
                    }
                } else {
                    return void 0;
                }
            } else if (!plugin) {
                $.data(this, 'plugin_' + plugin_name, new Plugin(this, options));
            }
        });

        return this;
    };

    $.openMtcOverlay  = function (options) {
        return new Plugin( $('body'), options );
    };


})(jQuery, window, document);
