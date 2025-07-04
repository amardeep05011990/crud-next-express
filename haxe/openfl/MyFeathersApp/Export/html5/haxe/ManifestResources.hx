package;

import haxe.io.Bytes;
import haxe.io.Path;
import lime.utils.AssetBundle;
import lime.utils.AssetLibrary;
import lime.utils.AssetManifest;
import lime.utils.Assets;

#if sys
import sys.FileSystem;
#end

#if disable_preloader_assets
@:dox(hide) class ManifestResources {
	public static var preloadLibraries:Array<Dynamic>;
	public static var preloadLibraryNames:Array<String>;
	public static var rootPath:String;

	public static function init (config:Dynamic):Void {
		preloadLibraries = new Array ();
		preloadLibraryNames = new Array ();
	}
}
#else
@:access(lime.utils.Assets)


@:keep @:dox(hide) class ManifestResources {


	public static var preloadLibraries:Array<AssetLibrary>;
	public static var preloadLibraryNames:Array<String>;
	public static var rootPath:String;


	public static function init (config:Dynamic):Void {

		preloadLibraries = new Array ();
		preloadLibraryNames = new Array ();

		rootPath = null;

		if (config != null && Reflect.hasField (config, "rootPath")) {

			rootPath = Reflect.field (config, "rootPath");

			if(!StringTools.endsWith (rootPath, "/")) {

				rootPath += "/";

			}

		}

		if (rootPath == null) {

			#if (ios || tvos || webassembly)
			rootPath = "assets/";
			#elseif android
			rootPath = "";
			#elseif (console || sys)
			rootPath = lime.system.System.applicationDirectory;
			#else
			rootPath = "./";
			#end

		}

		#if (openfl && !flash && !display)
		openfl.text.Font.registerFont (__ASSET__OPENFL__assets_fonts_pf_ronda_seven_ttf);
		
		#end

		var data, manifest, library, bundle;

		data = '{"name":null,"assets":"aoy4:sizei26265y4:typey4:FONTy9:classNamey40:__ASSET__assets_fonts_pf_ronda_seven_ttfy2:idy35:assets%2Ffonts%2Fpf_ronda_seven.ttfy7:preloadtgh","rootPath":null,"version":2,"libraryArgs":[],"libraryType":null}';
		manifest = AssetManifest.parse (data, rootPath);
		library = AssetLibrary.fromManifest (manifest);
		Assets.registerLibrary ("default", library);
		

		library = Assets.getLibrary ("default");
		if (library != null) preloadLibraries.push (library);
		else preloadLibraryNames.push ("default");
		

	}


}

#if !display
#if flash

@:keep @:bind @:noCompletion #if display private #end class __ASSET__assets_fonts_pf_ronda_seven_ttf extends null { }
@:keep @:bind @:noCompletion #if display private #end class __ASSET__manifest_default_json extends null { }


#elseif (desktop || cpp)

@:keep @:font("Export/html5/obj/webfont/pf_ronda_seven.ttf") @:noCompletion #if display private #end class __ASSET__assets_fonts_pf_ronda_seven_ttf extends lime.text.Font {}
@:keep @:file("") @:noCompletion #if display private #end class __ASSET__manifest_default_json extends haxe.io.Bytes {}



#else

@:keep @:expose('__ASSET__assets_fonts_pf_ronda_seven_ttf') @:noCompletion #if display private #end class __ASSET__assets_fonts_pf_ronda_seven_ttf extends lime.text.Font { public function new () { #if !html5 __fontPath = "assets/fonts/pf_ronda_seven"; #else ascender = 1375; descender = -250; height = 1668; numGlyphs = 230; underlinePosition = -250; underlineThickness = 125; unitsPerEM = 1000; #end name = "PF Ronda Seven"; super (); }}


#end

#if (openfl && !flash)

#if html5
@:keep @:expose('__ASSET__OPENFL__assets_fonts_pf_ronda_seven_ttf') @:noCompletion #if display private #end class __ASSET__OPENFL__assets_fonts_pf_ronda_seven_ttf extends openfl.text.Font { public function new () { __fromLimeFont (new __ASSET__assets_fonts_pf_ronda_seven_ttf ()); super (); }}

#else
@:keep @:expose('__ASSET__OPENFL__assets_fonts_pf_ronda_seven_ttf') @:noCompletion #if display private #end class __ASSET__OPENFL__assets_fonts_pf_ronda_seven_ttf extends openfl.text.Font { public function new () { __fromLimeFont (new __ASSET__assets_fonts_pf_ronda_seven_ttf ()); super (); }}

#end

#end
#end

#end