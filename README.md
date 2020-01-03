==Overview==
version: 0.21<br>
mtc_overlay is a jQuery plugin for responsive overlay windows

*ajax a whole page into overlay
*ajax elements from a page into overlay

new to v0.21:
*single image functionality
*gallery functionality

new to v0.3:
* youtube support
* vimeo support
* ajax support

new to v0.4:
* resize improvements

* responsive video

* gallery without slick

* store scroll position on open

* fadein/out gallery images on switch

* default styling for buttons, titles

new to v0.6:
* video gallery
* solve the touch issue
* updated initialization code
* changes in resize to support video gallery

new to v0.7:
* options for margins, padding
* max_width option added. All references in css to max-width has been removed and are not supported anymore.
* title option removed, title now is set automatically via data-title instead of alt on image
* perfect scrollbar option in overlay box
* overlay scrollbar moved into the popup box (was fullheight before)
* option for fullscreen iframe
* changed variable names to proper format (from variableName to variable_name)
* resize cleanup. Only one resize function called now, common for video and image
* relative popup title support

new to v0.8:
* html content galleries
* refactored gallery code
* fixed minor gallery bugs
* loader icon
* gallery can be closed if loading content fails

new to v0.9:
* responsive option
* swipe gestures for gallery

new to v1.0:
* programmatic call
* iframe support

==Options==

'''button_html'''<br>
Use this to change the markup of the close button
<syntaxhighlight lang="javascript" enclose="div">
default: '<div class="overlayCloseButton"><a href="#">Close <i class="fa fa-remove"></i></a></div>'
datatype: string
</syntaxhighlight>

'''content_class'''<br>
Add custom class to wrap so you can change padding or whatever via CSS
<syntaxhighlight lang="javascript" enclose="div">
default: ''
datatype: string
</syntaxhighlight>

'''gallery'''<br>
Set to true to activate gallery functionality. Don't forget to set data-rel for items
<syntaxhighlight lang="javascript" enclose="div">
default: false
datatype: boolean
</syntaxhighlight>


'''gallery_prev_html'''<br>
Gallery previous button markup. Must have js_galleryNext class.
<syntaxhighlight lang="javascript" enclose="div">
default: '<button class="js_galleryPrev galleryPrev"><i class="fa fa-angle-left"></i></button>';
datatype: string
</syntaxhighlight>

'''gallery_next_html'''<br>
Gallery next button markup. Must have js_galleryNext class.
<syntaxhighlight lang="javascript" enclose="div">
default: '<button class="js_galleryPrev galleryPrev"><i class="fa fa-angle-left"></i></button>';
datatype: string
</syntaxhighlight>

'''fullscreen_iframe'''<br>
Special mode that will display iframe as tall as possible (useful for displaying pdfs)
<syntaxhighlight lang="javascript" enclose="div">
default:  false
datatype: boolean
</syntaxhighlight>

'''margin_vertical'''<br>
Vertical gap between overlay box and window
<syntaxhighlight lang="javascript" enclose="div">
default:  20
datatype: integer
</syntaxhighlight>

'''margin_horizontal'''<br>
Horizontal gap between overlay box and window
<syntaxhighlight lang="javascript" enclose="div">
default:  40
datatype: integer
</syntaxhighlight>

'''max_width'''<br>
Max width of the popup
<syntaxhighlight lang="javascript" enclose="div">
default:  1024
datatype: integer
</syntaxhighlight>

'''fade_time'''<br>
Overlay fade time in ms
<syntaxhighlight lang="javascript" enclose="div">
default:  300
datatype: integer
</syntaxhighlight>

'''perfect_scroll'''<br>
Sets if the perfectScroll plugin will be applied for the overlay scrollbar. This only matters for ajax popups since gallery and video will always be smaller or qual to window size.
<syntaxhighlight lang="javascript" enclose="div">
default:  true
datatype: boolean
</syntaxhighlight>

'''site_wrapper'''<br>
Site outer wrapper selector(one that's ONLY direct child of body). This is used for saving and restoring the scroll position on overlay open. 
<syntaxhighlight lang="javascript" enclose="div">
default:  '.siteWrapper'
datatype: string
</syntaxhighlight>

'''swipe'''<br>
if gallery enabled, allow change the iamges with swipes. Does not work with video (because Iframe hijacks events)
<syntaxhighlight lang="javascript" enclose="div">
default:  'true'
datatype: boolean
</syntaxhighlight>

'''disable_perfect_scroll_on_touch'''<br>
This option allows to turn off perfect scroll on touch devices. Useful for the galleries with ajax content - if perfect scrollbar is used then it will absorb all the events, and swipe won't work. 
<syntaxhighlight lang="javascript" enclose="div">
default:  'true'
datatype: boolean
</syntaxhighlight>

'''arrow_controls'''<br>
If set true allows to switch gallery with keyboard arrows. 
<syntaxhighlight lang="javascript" enclose="div">
default:  'true'
datatype: boolean
</syntaxhighlight>

'''close_on_esc'''<br>
Allows closing overlay with 'Escape' button. 
<syntaxhighlight lang="javascript" enclose="div">
default:  'true'
datatype: boolean
</syntaxhighlight>

'''swipe'''<br>
Allows changing gallery with swipe gesture on touchscreens. 
<syntaxhighlight lang="javascript" enclose="div">
default:  'true'
datatype: boolean
</syntaxhighlight>

'''inline'''<br>
If set true then content from same page (when using no-ajax) will be moved into overlay instead of copying it. Useful when you have forms with checkboxes and radios in popup - setting this to true solves issue with duplicate ids
<syntaxhighlight lang="javascript" enclose="div">
default:  'true'
datatype: boolean
</syntaxhighlight>

'''overlay_click_close'''<br>
If set false disables overlay close on background click
<syntaxhighlight lang="javascript" enclose="div">
default:  'true'
datatype: boolean
</syntaxhighlight>

'''responsive'''<br>
Slick style responsive parameter, allows to apply different settings at breakpoints. Desktop first.

<syntaxhighlight lang="javascript" enclose="div">
      default: [{
                breakpoint: 640,
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
            }]
    datatype: object
}
</syntaxhighlight>

==Callbacks==
'''beforeOpen'''<br>
Used to provide callbacks before open of the overlay window (before visible)
<syntaxhighlight lang="javascript" enclose="div">
default:  function () {}
datatype: function
</syntaxhighlight>

'''onOpen'''<br>
Used to provide callbacks on open of the overlay window
<syntaxhighlight lang="javascript" enclose="div">
default:  function () {}
datatype: function
</syntaxhighlight>

'''onClose'''<br>
Used to provide callbacks on close of the overlay window
<syntaxhighlight lang="javascript" enclose="div">
default:  function () {}
datatype: function
</syntaxhighlight>

==Install==

===Basic===
The following will ajax in a complete page/file

'''HTML'''
<syntaxhighlight lang="html4strict" enclose="div">
<a href="FILE_LOCATION" class="overlay">click to view</a>
</syntaxhighlight>

'''jQuery'''
<syntaxhighlight lang="html4strict" enclose="div">
$('.overlay').mtcOverlay();
</syntaxhighlight>

===Element on the same page===
The following will load in an element on the same page

<syntaxhighlight lang="html4strict" enclose="div">

   <div id="popup1" class="hideme">
        This is content of first popup
    </div>
    <div id="popup2" class="hideme">
        This is content of second popup
    </div>

    <ul>
        <li class="grid_3">
            <a class="mtcOverlay" href="#popup1" data-no-ajax="true">View</a>
        </li>
        <li class="grid_3">
            <a class="mtcOverlay" href="#popup2" data-no-ajax="true">View</a>
        </li>
    </ul>
</syntaxhighlight>


===Element within another page===
The following will ajax in an element within a page

'''HTML'''
<syntaxhighlight lang="html4strict" enclose="div">
<a href="FILE_LOCATION" class="overlay" data-filter=".js_elementClassName">click to view</a>
</syntaxhighlight>

'''jQuery'''
<syntaxhighlight lang="html4strict" enclose="div">
$('.overlay').mtcOverlay();
</syntaxhighlight>

===Popup title===
The following will add an image to the overlay.
*displaying image or video(single or gallery)
*data-title attribute on link

As of version 0.7 there is no need to set a flag in the plugin options, title is read automatically if present.
'''HTML'''
<syntaxhighlight lang="html4strict" enclose="div">
<a href="large-image-src" class="overlay" data-title="this is a title">
    <img src="small-image-src" alt="" />
</a>
</syntaxhighlight>

'''jQuery'''
<syntaxhighlight lang="html4strict" enclose="div">
$('.overlay').mtcOverlay();
</syntaxhighlight>

===Gallery of images===
The following will add a gallery to the overlay with titles on each image.
*The image src must have an extension of jpg, jpeg, png or gif. 
*The alt tag will become a title. this can be left blank if none provided.
*Each link must have a rel attr applied to it. This rel attr should be the same for each image in the same gallery
*for older overlay versions try using rel instead of data-rel if it's not working right away

'''HTML'''
<syntaxhighlight lang="html4strict" enclose="div">
<a href="large-image-src" class="overlay" data-rel="WHATEVER_YOU_WANT_IT_TO_BE" data-title="TITLE_GOES_HERE">
    <img src="small-image-src" alt="" />
</a>

<a href="large-image-src" class="overlay" data-rel="WHATEVER_YOU_WANT_IT_TO_BE" data-title="TITLE_GOES_HERE">
    <img src="small-image-src" alt="" />
</a>

<a href="large-image-src" class="overlay" data-rel="WHATEVER_YOU_WANT_IT_TO_BE" data-title="TITLE_GOES_HERE">
    <img src="small-image-src" alt="" />
</a>
</syntaxhighlight>

'''jQuery'''
<syntaxhighlight lang="html4strict" enclose="div">
$('.overlay').mtcOverlay({
    gallery: true
});
</syntaxhighlight>

===Changing Slick Options===
There must be an active gallery as that is only when slick is used. Any option available to slick normally is available here.

As if version 0.4 slick is depricated.

'''jQuery'''
<syntaxhighlight lang="html4strict" enclose="div">
$('.overlay').mtcOverlay({
    gallery: true,
    slick: {
        dots: true,
        arrows: false
    }
});
</syntaxhighlight>

=== Closing the overlay from another script ===

If you want to close the overlay on another event a simple method is triggering a click on the overlay close button (you may need to change the class if you have overridden it).

'''jQuery'''
<syntaxhighlight lang="html4strict" enclose="div">
$('.overlayCloseButton').trigger('click');
</syntaxhighlight>
 


===Video Options===

If video mode is set to true this supports Vimeo and Youtube, just paste in the url into the href and it will take out the video ID's automagically.

Such as: https://www.youtube.com/watch?v=KSFgolB7HHE
Or: https://vimeo.com/22212265


Options that can be applied:

<syntaxhighlight lang="html4strict" enclose="div">
video_settings: {
    autoplay: true,
    width: 500,
    height: 280
}
</syntaxhighlight>

Autoplay is default by false. Width and height are also self explanatory.

===Video Gallery===

As of version 0.6 it's possible to add youtube/vimeo iframes to the gallery.

Such as: https://www.youtube.com/watch?v=KSFgolB7HHE
Or: https://vimeo.com/22212265


To enable videos in the gallery initialize plugin like this:

<syntaxhighlight lang="html4strict" enclose="div">
$('.mtcOverlayGallery').mtcOverlay({
    gallery: true,
    video: true,
    video_settings: {
        width: 1024,
        height: 768
    },
});
</syntaxhighlight>

In the markup set the data-video to true for the video items. This is example of mixed galley of images and videos:
<syntaxhighlight lang="html4strict" enclose="div">
    <ul>
        <li class="grid_3">
            <a class="mtcOverlayGallery" href="LINK_TO_IMAGE" data-rel="GALLERY_NAME">View image</a>
        </li>
        <li class="grid_3">
            <a class="mtcOverlayGallery" href="LINK_TO_VIDEO" data-video="true" data-rel="GALLERY_NAME">View  video</a>
        </li>
        <li class="grid_3">
            <a class="mtcOverlayGallery" href="LINK_TO_IMAGE" data-rel="GALLERY_NAME">View image</a>
        </li>
    </ul>
</syntaxhighlight>

===HTML Gallery===

As of version 0.6 it's possible to add youtube/vimeo iframes to the gallery.

Such as: https://www.youtube.com/watch?v=KSFgolB7HHE
Or: https://vimeo.com/22212265


To enable videos in the gallery initialize plugin like this:

<syntaxhighlight lang="html4strict" enclose="div">
$('.mtcOverlayGallery').mtcOverlay({
    gallery: true
});
</syntaxhighlight>

In the markup set the data-ajax to true for the items:
<syntaxhighlight lang="html4strict" enclose="div">
    <ul>
        <li class="grid_3">
            <a class="mtcOverlayGallery" href="LINK_TO_CONTENT" data-ajax="true" data-rel="GALLERY_NAME">View</a>
        </li>
        <li class="grid_3">
            <a class="mtcOverlayGallery" href="LINK_TO_CONTENT" data-ajax="true" data-rel="GALLERY_NAME">View</a>
        </li>
    </ul>
</syntaxhighlight>

If instead of using ajax you would like to show gallery from hidden blocks, simply use data-no-ajax instead of ajax and use selector in the href attribute:

<syntaxhighlight lang="html4strict" enclose="div">

   <div id="popup1" class="hideme">
        This is content of first popup
    </div>
    <div id="popup2" class="hideme">
        This is content of second popup
    </div>

    <ul>
        <li class="grid_3">
            <a class="mtcOverlayGallery" href="#popup1" data-no-ajax="true" rel="GALLERY_NAME">View</a>
        </li>
        <li class="grid_3">
            <a class="mtcOverlayGallery" href="#popup2" data-no-ajax="true" rel="GALLERY_NAME">View</a>
        </li>
    </ul>
</syntaxhighlight>

===Open programmatically===

Version 1.0 added programmatic call to overlay - it now can be opened anywhere from javascript code with $.openMtcOverlay.
All usual modes are available apart from gallery. Some examples of calls (note how overlay is called)
<syntaxhighlight lang="html4strict" enclose="div">

     $('.js_openOverlayImage').on('click', function (e) {
        e.preventDefault();
        $.openMtcOverlay({
            target: 'http://placehold.it/1024x600.png',
            image: true
        });
    });

    $('.js_openOverlayYoutube').on('click', function (e) {
        e.preventDefault();
        $.openMtcOverlay({
            target: 'http://www.youtube.com/watch?v=1Wh8RzcQZr4',
            video: true
        });
    });

    $('.js_openOverlayVimeo').on('click', function (e) {
        e.preventDefault();
        $.openMtcOverlay({
            target: 'https://vimeo.com/116046838',
            video: true
        });
    });

     $('.js_openOverlayIframe').on('click', function (e) {
        e.preventDefault();
        $.openMtcOverlay({
            target: 'http://www.mtcmedia.co.uk/',
            iframe: true
        });
    });

    $('.js_openOverlayAjax').on('click', function (e) {
        e.preventDefault();
        $.openMtcOverlay({
            target: '/core/css/layouts/plugins/overlay/plugin_includes/mixed_popup.twig',
        });
    });

     $('.js_openOverlayBlock').on('click', function (e) {
        e.preventDefault();
        $.openMtcOverlay({
            no_ajax: true,
            target: '#popup2',
        });
    });
</syntaxhighlight>

===Fullheight iframe popup===
This mode is useful for displaying stuff like pdf's in popup.
Overlay code:
<syntaxhighlight lang="html4strict" enclose="div">
<a class="js_pdfOverlay" href="/sites/www/templates/includes/pdf_popup.twig"><i class="fa fa-play"></i> Open</a>
</syntaxhighlight>

pdf popup code:
<syntaxhighlight lang="html4strict" enclose="div">
<iframe src="/uploads/pdf/sample.pdf"></iframe>
</syntaxhighlight>

js code:
<syntaxhighlight lang="html4strict" enclose="div">
$('.js_pdfOverlay').mtcOverlay({
    fullscreen_iframe: true
});
</syntaxhighlight>

==Tips and tricks==
===Calling resize manually===
This is needed when popup has forms, and it changes the height on error or success messages. Overlay is bind to window resize, so one can trigger its resize function by:
<syntaxhighlight lang="html4strict" enclose="div">
$(window).resize();
</syntaxhighlight>

if one needs trigger ONLY overlay resize then:
<syntaxhighlight lang="html4strict" enclose="div">
$(window).trigger('resize.overlay');
</syntaxhighlight>
