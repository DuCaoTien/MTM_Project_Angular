/**
 * @license Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function (config) {
    config.language = 'en';
    config.wsc_lang = 'en_US';
    config.extraPlugins = 'lineutils';
    config.extraPlugins = 'widget';
    config.extraPlugins = 'dialog';
    config.extraPlugins = 'prism';
    config.skin = 'office2013';
    config.htmlEncodeOutput = false;
    config.allowedContent = true; // disable ckeditor auto remove custom attribute in <source>

    // ALLOW <i></i>
    config.protectedSource.push(/<i[^>]*><\/i>/g);
    CKEDITOR.dtd.$removeEmpty['i'] = false;
    CKEDITOR.dtd.$removeEmpty.i = 0;
    CKEDITOR.dtd.$removeEmpty['span'] = false;

    config.smiley_columns = 10;
};