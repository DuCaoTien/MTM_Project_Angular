/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.plugins.add('smiley', {
    requires: 'dialog',
    // jscs:disable maximumLineLength
    lang: 'af,ar,bg,bn,bs,ca,cs,cy,da,de,el,en,en-au,en-ca,en-gb,eo,es,et,eu,fa,fi,fo,fr,fr-ca,gl,gu,he,hi,hr,hu,id,is,it,ja,ka,km,ko,ku,lt,lv,mk,mn,ms,nb,nl,no,pl,pt,pt-br,ro,ru,si,sk,sl,sq,sr,sr-latn,sv,th,tr,tt,ug,uk,vi,zh,zh-cn', // %REMOVE_LINE_CORE%
    // jscs:enable maximumLineLength
    icons: 'smiley', // %REMOVE_LINE_CORE%
    hidpi: true, // %REMOVE_LINE_CORE%
    init: function (editor) {
        editor.config.smiley_path = editor.config.smiley_path || (this.path + 'images/');
        editor.addCommand('smiley', new CKEDITOR.dialogCommand('smiley', {
            allowedContent: 'img[alt,height,!src,title,width]',
            requiredContent: 'img'
        }));
        editor.ui.addButton && editor.ui.addButton('Smiley', {
            label: editor.lang.smiley.toolbar,
            command: 'smiley',
            toolbar: 'insert,50'
        });
        CKEDITOR.dialog.add('smiley', this.path + 'dialogs/smiley.js');
    }
});

/**
 * The base path used to build the URL for the smiley images. It must end with a slash.
 *
 *		config.smiley_path = 'http://www.example.com/images/smileys/';
 *
 *		config.smiley_path = '/images/smileys/';
 *
 * @cfg {String} [smiley_path=CKEDITOR.basePath + 'plugins/smiley/images/']
 * @member CKEDITOR.config
 */

/**
 * The file names for the smileys to be displayed. These files must be
 * contained inside the URL path defined with the {@link #smiley_path} setting.
 *
 *		// This is actually the default value.
 *		config.smiley_images = [
 *			'regular_smile.png','sad_smile.png','wink_smile.png','teeth_smile.png','confused_smile.png','tongue_smile.png',
 *			'embarrassed_smile.png','omg_smile.png','whatchutalkingabout_smile.png','angry_smile.png','angel_smile.png','shades_smile.png',
 *			'devil_smile.png','cry_smile.png','lightbulb.png','thumbs_down.png','thumbs_up.png','heart.png',
 *			'broken_heart.png','kiss.png','envelope.png'
 *		];
 *
 * @cfg
 * @member CKEDITOR.config
 */
CKEDITOR.config.smiley_images = ["001_dis_like.png", "001_like.png", "001_trollface.png", "001_trollface_10.png", "001_trollface_11.png", "001_trollface_12.png", "001_trollface_13.png", "001_trollface_2.png", "001_trollface_3.png", "001_trollface_4.png", "001_trollface_5.png", "001_trollface_6.png", "001_trollface_8.png", "001_trollface_9.png", "002_blush.png", "002_grin.png", "002_grinning.png", "002_heart_eyes.png", "002_innocent.png", "002_joy.png", "002_laughing.png", "002_relaxed.png", "002_simple_smile.png", "002_smile.png", "002_smiley.png", "002_sunglasses.png", "002_sweat_smile.png", "003_ghost.png", "003_stuck_out_tongue.png", "003_stuck_out_tongue_closed_eyes.png", "003_stuck_out_tongue_winking_eye.png", "003_yum.png", "004.1_imp.png", "004.1_smiling_imp.png", "004.2_astonished.png", "004.2_expressionless.png", "004.2_flushed.png", "004.2_relieved.png", "004.2_scream.png", "004.2_sleeping.png", "004.2_sleepy.png", "004.3_cold_sweat.png", "004.3_fearful.png", "004.4_kissing_closed_eyes.png", "004.4_kissing_heart.png", "004.5_japanese_goblin.png", "004.5_japanese_ogre.png", "004.6_smirk.png", "004.6_wink.png", "004.7_shit.png", "004.7_mask.png", "004.7_neckbeard.png", "005.1_confounded.png", "005.1_tired_face.png", "005.1_weary.png", "005.2_anguished.png", "005.2_confused.png", "005.2_cry.png", "005.2_disappointed.png", "005.2_frowning.png", "005.2_hushed.png", "005.2_neutral_face.png", "005.2_no_mouth.png", "005.2_open_mouth.png", "005.2_sob.png", "005.2_sweat.png", "005.2_unamused.png", "005.2_worried.png", "005.3_angry.png", "005.3_rage.png", "005.3_triumph.png", "006_hear_no_evil.png", "006_see_no_evil.png", "006_speak_no_evil.png", "007_older_man.png", "007_older_woman.png", "008_alien.png", "008_angel.png", "008_baby.png", "008_bow.png", "008_boy.png", "008_bride_with_veil.png", "008_construction_worker.png", "008_cop.png", "008_cow.png", "008_dog.png", "008_guardsman.png", "008_man_with_turban.png", "008_santa.png", "008_shipit.png", "008_skull.png", "009_clap.png", "009_ear.png", "009_eyes.png", "009_facepunch.png", "009_fist.png", "009_fu.png", "009_hand.png", "009_metal.png", "009_muscle.png", "009_nose.png", "009_ok_hand.png", "009_open_hands.png", "009_point_down.png", "009_point_left.png", "009_point_right.png", "009_point_up.png", "009_point_up_2.png", "009_pray.png", "009_raised_hand.png", "009_raised_hands.png", "009_v.png", "009_wave.png", "010_beer.png", "010_beers.png", "011.1_broken_heart.png", "011.1_heart.png", "011_cancer.png", "011_couple_with_heart.png", "011_couplekiss.png", "011_cupid.png", "011_kiss.png", "012_massage.png", "012_no_good.png", "012_ok_woman.png", "013_beetle.png", "013_cow2.png", "013_crocodile.png", "013_mouse2.png", "013_moyai.png", "013_octocat.png", "013_octopus.png", "013_paw_prints.png", "013_poodle.png", "013_rabbit2.png", "013_snail.png", "013_snake.png", "013_turtle.png", "013_water_buffalo.png", "013_whale.png", "014_atm.png", "014_dollar.png", "014_gift.png", "014_money_with_wings.png", "014_moneybag.png", "015_bulb.png", "015_cloud.png", "015_dash.png", "015_ocean.png", "015_partly_sunny.png", "015_sparkles.png", "015_sweat_drops.png", "015_thought_balloon.png", "015_zap.png", "016_100.png", "016_alarm_clock.png", "016_ambulance.png", "016_anchor.png", "016_baby_bottle.png", "016_banana.png", "016_bikini.png", "016_bomb.png", "016_bread.png", "016_bug.png", "016_bust_in_silhouette.png", "016_checkered_flag.png", "016_cl.png", "016_clapper.png", "016_clipboard.png", "016_clock1.png", "016_coffee.png", "016_corn.png", "016_custard.png", "016_dart.png", "016_date.png", "016_fire.png", "016_gun.png", "016_key.png", "016_lollipop.png", "016_loop.png", "016_loudspeaker.png", "016_love_letter.png", "016_mag_right.png", "016_microphone.png", "016_mortar_board.png", "016_newspaper.png", "016_recycle.png", "016_rocket.png", "016_rotating_light.png", "016_rowboat.png", "016_swimmer.png", "016_syringe.png", "016_tada.png", "016_tea.png", "016_toilet.png", "016_vertical_traffic_light.png", "016_wrench.png", "017_exclamation.png", "017_interrobang.png", "017_x.png", "018_angry.png", "018_big ok.png", "018_ble.png", "018_chaiyo.png", "018_cookie.png", "018_cool.png", "018_cry, please.png", "018_cry.png", "018_done.png", "018_drink.png", "018_eat.png", "018_good luck.png", "018_good night.png", "018_good.png", "018_hangout.png", "018_happy.png", "018_hit.png", "018_hope.png", "018_I have a question.png", "018_knock out.png", "018_lalala.png", "018_like.png", "018_lol.png", "018_love.png", "018_no solid.png", "018_not happy.png", "018_oh no.png", "018_oh.png", "018_ok.png", "018_pain.png", "018_please.png", "018_rolling.png", "018_see you.png", "018_shock.png", "018_shy.png", "018_so shy.png", "018_strong.png", "018_surprise.png", "018_take it easy.png", "018_tea.png", "018_u are welcome.png", "018_uh huh.png", "018_worry.png", "018_wow.png", "018_yes madam.png", "018_yes.png", "018_yolo.png"];

/**
 * The description to be used for each of the smileys defined in the
 * {@link CKEDITOR.config#smiley_images} setting. Each entry in this array list
 * must match its relative pair in the {@link CKEDITOR.config#smiley_images}
 * setting.
 *
 *		// Default settings.
 *		config.smiley_descriptions = [
 *			'smiley', 'sad', 'wink', 'laugh', 'frown', 'cheeky', 'blush', 'surprise',
 *			'indecision', 'angry', 'angel', 'cool', 'devil', 'crying', 'enlightened', 'no',
 *			'yes', 'heart', 'broken heart', 'kiss', 'mail'
 *		];
 *
 *		// Use textual emoticons as description.
 *		config.smiley_descriptions = [
 *			':)', ':(', ';)', ':D', ':/', ':P', ':*)', ':-o',
 *			':|', '>:(', 'o:)', '8-)', '>:-)', ';(', '', '', '',
 *			'', '', ':-*', ''
 *		];
 *
 * @cfg
 * @member CKEDITOR.config
 */
CKEDITOR.config.smiley_descriptions = ["dis like", "like", "trollface", "trollface 10", "trollface 11", "trollface 12", "trollface 13", "trollface 2", "trollface 3", "trollface 4", "trollface 5", "trollface 6", "trollface 8", "trollface 9", "blush", "grin", "grinning", "heart eyes", "innocent", "joy", "laughing", "relaxed", "simple smile", "smile", "smiley", "sunglasses", "sweat smile", "ghost", "stuck out tongue", "stuck out tongue closed eyes", "stuck out tongue winking eye", "yum", "imp", "smiling imp", "astonished", "expressionless", "flushed", "relieved", "scream", "sleeping", "sleepy", "cold sweat", "fearful", "kissing closed eyes", "kissing heart", "japanese goblin", "japanese ogre", "smirk", "wink", "shit", "mask", "neckbeard", "confounded", "tired face", "weary", "anguished", "confused", "cry", "disappointed", "frowning", "hushed", "neutral face", "no mouth", "open mouth", "sob", "sweat", "unamused", "worried", "angry", "rage", "triumph", "hear no evil", "see no evil", "speak no evil", "older man", "older woman", "alien", "angel", "baby", "bow", "boy", "bride with veil", "construction worker", "cop", "cow", "dog", "guardsman", "man with turban", "santa", "shipit", "skull", "clap", "ear", "eyes", "facepunch", "fist", "fu", "hand", "metal", "muscle", "nose", "ok hand", "open hands", "point down", "point left", "point right", "point up", "point up 2", "pray", "raised hand", "raised hands", "v", "wave", "beer", "beers", "broken heart", "heart", "cancer", "couple with heart", "couplekiss", "cupid", "kiss", "massage", "no good", "ok woman", "beetle", "cow2", "crocodile", "mouse2", "moyai", "octocat", "octopus", "paw prints", "poodle", "rabbit2", "snail", "snake", "turtle", "water buffalo", "whale", "atm", "dollar", "gift", "money with wings", "moneybag", "bulb", "cloud", "dash", "ocean", "partly sunny", "sparkles", "sweat drops", "thought balloon", "zap", "100", "alarm clock", "ambulance", "anchor", "baby bottle", "banana", "bikini", "bomb", "bread", "bug", "bust in silhouette", "checkered flag", "cl", "clapper", "clipboard", "clock1", "coffee", "corn", "custard", "dart", "date", "fire", "gun", "key", "lollipop", "loop", "loudspeaker", "love letter", "mag right", "microphone", "mortar board", "newspaper", "recycle", "rocket", "rotating light", "rowboat", "swimmer", "syringe", "tada", "tea", "toilet", "vertical traffic light", "wrench", "exclamation", "interrobang", "x", "angry", "big ok", "ble", "chaiyo", "cookie", "cool", "cry, please", "cry", "done", "drink", "eat", "good luck", "good night", "good", "hangout", "happy", "hit", "hope", "I have a question", "knock out", "lalala", "like", "lol", "love", "no solid", "not happy", "oh no", "oh", "ok", "pain", "please", "rolling", "see you", "shock", "shy", "so shy", "strong", "surprise", "take it easy", "tea", "u are welcome", "uh huh", "worry", "wow", "yes madam", "yes", "yolo"];

/**
 * The number of columns to be generated by the smilies matrix.
 *
 *		config.smiley_columns = 6;
 *
 * @since 3.3.2
 * @cfg {Number} [smiley_columns=8]
 * @member CKEDITOR.config
 */