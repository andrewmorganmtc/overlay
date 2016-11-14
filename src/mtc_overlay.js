/*!
* mtcOverlay - A jQuery plugin for responsive overlay windows
* Version: 0.91
* Author: Andrew Morgan, Paul McAvoy, Aaron Spence, Valdis Ceirans
*/

;(function ($, window, document) {

    'use strict';

    // Create the defaults once
    var plugin_name = 'mtcOverlay',
        plugin;

    // The actual plugin constructor
    function Plugin(element, options) {
        plugin = this;
        plugin.element = element;
        plugin.$this = $(plugin.element);
        plugin.defaults = {
            buttonHtml: '<div class="overlayCloseButton"><a href="#"><i class="fa fa-remove"></i></a></div>',
            content_class: '',
            gallery: false,
            gallery_prev_html: '<button class="js_galleryPrev galleryPrev"><i class="fa fa-angle-left"></i></button>',
            gallery_next_html: '<button class="js_galleryNext galleryNext"><i class="fa fa-angle-right"></i></button>',
            video: false,
            video_settings: {
                autoplay: false,
                width: 500,
                height: 284
            },
            fullscreen_iframe: false,
            margin_vertical: 20,
            margin_horizontal: 20,
            max_width: 1024,
            fade_time: 300,
            padding_vertical: 30,
            padding_horizontal: 30,
            perfect_scroll: true,
            disable_perfect_scroll_on_touch: true,
            site_wrapper: '.siteWrapper',
            arrow_controls: true,
            close_on_esc: true,
            swipe: true,
            responsive: [
                {
                    breakpoint: 800,
                    settings: {
                        margin_vertical: 10,
                        margin_horizontal: 10,
                    }
                },
                {
                    breakpoint: 640,
                    settings: {
                        margin_vertical: 5,
                        margin_horizontal: 5,
                    }
                }
            ],
            beforeOpen: function () {},
            onOpen: function () {},
            onClose: function () {}
        };
        plugin.all_settings = $.extend(true, {}, plugin.defaults, options);
        plugin.settings = null;
        plugin._defaults = plugin.defaults;
        plugin._name = plugin_name;
        plugin.gallery_loading = false;
        plugin.active_element = null;

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
                height: 'auto'
            });

            $('.overlayBox').css({
                width: 'auto',
                top: overlay_box_top,
                left: overlay_box_left,
                right: overlay_box_right,
                bottom: 'auto',
                paddingLeft: plugin.settings.padding_horizontal,
                paddingRight: plugin.settings.padding_horizontal,
                paddingTop: plugin.settings.padding_vertical,
                paddingBottom: plugin.settings.padding_vertical
            });

            // if image then max width is either max_width or image width
            if ($('.overlayImage').length) {
                content_width = Math.min(plugin.settings.max_width - 2 * plugin.settings.padding_horizontal, $('.overlayContentInner > img').width());
            } else {
                content_width = Math.min($('.overlayBoxOuter').width() - 2 * plugin.settings.margin_horizontal, plugin.settings.max_width) - 2 * plugin.settings.padding_horizontal;
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
                    height: 'auto',
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

            if (plugin.settings.perfect_scroll && $('.overlayBox .ps-scrollbar-y').length > 0) {
                $('.overlayBox').perfectScrollbar('update');
            }
        },

        imageMode: function (callback) {
            var src = plugin.active_element.attr('href'),
                image = $('<img/>');


            $('.overlayContentInner').addClass('overlayImage');

            image.on('load', function () {
                $('.overlayBox .overlayImage').append(image);
                callback();
                plugin.resize();
            });

            image.attr({
                'src' : src
            });

            plugin.imageTitle();
        },

        displayOverlay: function () {

            // add close button to overlay
            $('.overlayBox').append($(plugin.settings.buttonHtml));

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

                if (plugin.settings.perfect_scroll && $('.overlayBox .ps-scrollbar-y').length > 0) {
                    $('.overlayBox').perfectScrollbar('update');
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
                data_filter = plugin.$this.attr('data-filter'),
                url = plugin.active_element.attr('href');
            // do ajax
            $.ajax({
                type: 'post',
                url: url,
                dataType: 'html',
                success: function (response) {

                    // check if ajaxing whole page or section of page
                    if (data_filter === undefined) {
                        html = response;
                    } else {
                        html = $(data_filter, response).wrap('<div class="overlayContainer"></div>').html();
                    }

                    // add html to page
                    $('.overlayContentInner').addClass('overlayAjax').html(html);

                    if (plugin.settings.fullscreen_iframe) {
                        $('.overlayBox').addClass('overlayFullscreen');
                    }

                    plugin.ajaxImagesLoaded(function () {
                        if (plugin.settings.perfect_scroll) {
                            //if not touch device and enabled on touch
                            if (!($('html').hasClass('touchevents') && plugin.settings.disable_perfect_scroll_on_touch)) {
                                $('.overlayBox').perfectScrollbar();
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
                url = plugin.active_element.attr('href');

            target_element = $(url);

            if (target_element.length > 0) {
                html = target_element.wrap('<div class="overlayContainer"></div>').html();
            }

            // add html to page
            $('.overlayContentInner').addClass('overlayAjax').html(html);

            if (plugin.settings.fullscreen_iframe) {
                $('.overlayBox').addClass('overlayFullscreen');
            }

            plugin.imageTitle();

            plugin.ajaxImagesLoaded(function () {
                if (plugin.settings.perfect_scroll) {
                    //if not touch device and enabled on touch
                    if (!($('html').hasClass('touchevents') && plugin.settings.disable_perfect_scroll_on_touch)) {
                        $('.overlayBox').perfectScrollbar();
                    }
                }

                callback();
                plugin.resize();
            });

        },

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

        gallery: function (rel) {

            // set some vars
            var gallery_images = $('[rel="' + plugin.active_element.attr('rel') + '"]');

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

                $('.overlayBox .overlayContent').width($('.overlayBox .overlayContent').width());
                $('.overlayBox .overlayContent').height($('.overlayBox .overlayContent').height());

                // fade out existing
                $('.overlayBox .overlayContent .overlayContentInner').fadeOut(plugin.settings.fade_time, function () {

                    // destroy perfect scrollbar
                    if (plugin.settings.perfect_scroll && $('.overlayBox .ps-scrollbar-y').length > 0) {
                        $('.overlayBox').perfectScrollbar('destroy');
                    }

                    // fix the dimensions and remove previous content
                    overlay_content.width(overlay_content.width());
                    overlay_content.height(overlay_content.height());

                    overlay_content.find('.overlayContentInner').remove();
                    overlay_content.prepend('<div class="overlayContentInner"></div>');

                    overlay_content.addClass('overlayContentLoading');
                    plugin.switchGalleryMode(function () {
                        $('.overlayContentInner').hide();
                        overlay_content.removeClass('overlayContentLoading');
                        $('.overlayContentInner').fadeIn(plugin.settings.fade_time);
                        plugin.gallery_loading = false;
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

                    if (key === 37 && $('.overlayBox .js_galleryPrev').is(':visible')) {
                        $('.overlayBox .js_galleryPrev').trigger('click');
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
                plugin.videoMode();
                callback();
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

        initVideo: function () {

            var iframe = $(".overlayVideo iframe"),
                iframe_ratio = 100 * iframe.height() / iframe.width();

            $(".overlayVideo").css({
                height: '0',
                width: '100%',
                paddingTop: iframe_ratio + '%'
            });

            iframe.css({
                width: '100%',
                height: '100%'
            });

        },

        videoMode: function () {

            var autoplay = '',
                videoid = '',
                iframe_src = '',
                can_initialize = false,
                url = plugin.active_element.attr('href');

            // autoplay
            if (plugin.settings.video_settings.autoplay === true) {
                autoplay = '?autoplay=1';
            }

            // lets iframe in the video
            if (url.toLowerCase().indexOf("youtu") >= 0) {
                videoid = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
                iframe_src = '<iframe src="//www.youtube.com/embed/' + videoid[1] + autoplay + '" width="' + plugin.settings.video_settings.width +'" height="' + plugin.settings.video_settings.height +'" frameborder="0" allowfullscreen></iframe>';
                can_initialize = true;
            } else if (url.toLowerCase().indexOf("vimeo") >= 0) {
                videoid = url.match(/https?:\/\/(www\.)?vimeo.com\/(\d+)($|\/)/);
                iframe_src = '<iframe src="//player.vimeo.com/video/' + videoid[2] + autoplay + '" width="' + plugin.settings.video_settings.width +'" height="' + plugin.settings.video_settings.height +'" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
                can_initialize = true;
            }

            if (can_initialize === true) {
                $('.overlayContentInner').addClass('overlayVideo');
                $('.overlayVideo').html(iframe_src);
            }

            plugin.initVideo();
            plugin.imageTitle();
            plugin.resize();

        },

        overlayOpen: function () {

            var url = plugin.$this.attr('href'),
                rel = plugin.$this.attr('rel'),
                extension,
                extensions = [
                    'jpg',
                    'jpeg',
                    'png',
                    'gif'
                ],
                scroll_on_open,
                no_ajax = plugin.$this.attr('data-no-ajax');

            plugin.active_element = plugin.$this;

            extension = url.split('.').pop().toLowerCase();

            // store scroll postion
            scroll_on_open = $('body').scrollTop() || $('html').scrollTop();

            $('body').data('stored-scroll', scroll_on_open);

            $(plugin.settings.site_wrapper).css({
                position: 'relative',
                top: -scroll_on_open
            });

            // append overlay background and container to body
            $('body').addClass('noScroll');

            $('body').append('<div class="overlayBoxOuter"><div class="overlayBox"><div class="overlayContent"><div class="overlayContentInner"></div></div></div>');

            // add loading class
            $('.overlayBoxOuter').addClass('overlayLoading');

            // Close overlay when background is clicked
            $('.overlayBoxOuter').on('click', function (e) {
                if (e.target === this) {
                    plugin.overlayClose();
                }
            });

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
            if (rel && $('[rel="' + rel + '"]').length > 1 && plugin.settings.gallery === true) {
                plugin.gallery();
            } else {
                // if extention is in array then we have to grab an image and not ajax
                if ($.inArray(extension, extensions) > -1) {
                    plugin.imageMode(plugin.displayOverlay);
                    // video? lets insert it
                } else if (plugin.settings.video === true) {
                    plugin.videoMode();
                    plugin.displayOverlay();
                    // do ajax
                } else {
                    // show block from same page
                    if (typeof(no_ajax) !== "undefined") {
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

            $('body').off('click.gallery');

            $('body').off('swipeleft.gallery');

            $('body').off('swiperight.gallery');

            $(document).off('keydown.gallery');

            $(document).off('keydown.overlay');

            $('body').removeClass('noScroll');

            $('.overlayBoxOuter').animate({
                opacity: 0
            }, 300, function () {
                plugin.destroy();
            });

        },

        destroy: function () {

            if (plugin.settings.perfect_scroll && $('.overlayBox.ps-container').length > 0) {
                $('.overlayBox').perfectScrollbar('destroy');
            }

            // remove some elements from the DOM
            $('.overlayCloseButton').remove();
            $('.overlayBoxOuter').remove();

            $(plugin.settings.site_wrapper).css({
                'top': 0
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

})(jQuery, window, document);
