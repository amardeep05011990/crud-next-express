package;

import openfl.display.Sprite;
import openfl.text.TextField;
import openfl.text.TextFieldType;
import openfl.text.TextFormat;
import openfl.events.MouseEvent;
import openfl.net.URLLoader;
import openfl.net.URLRequest;
import openfl.net.URLRequestMethod;
import openfl.net.URLVariables;

class Main extends Sprite {
    var input:TextField;
    var submitBtn:TextField;
    var resultBox:TextField;

    public function new() {
        super();
        init();
    }

    function init():Void {
        // Input Field
        // input = new TextField();
        // input.type = TextFieldType.INPUT;
        // input.border = true;
        // input.width = 300;
        // input.height = 30;
        // input.x = 50;
        // input.y = 50;
        // input.defaultTextFormat = new TextFormat("Arial", 18);
        // input.text = "Enter text";
        // addChild(input);
		var input = new TextField();
        input.type = TextFieldType.INPUT;
        input.border = true;
        input.borderColor = 0xCCCCCC;
        input.background = true;
        input.backgroundColor = 0xF8F9FA;
        input.defaultTextFormat = new TextFormat("Arial", 14, 0x333333);
        input.width = 240;
        input.height = 25;
        input.x = x;
        input.y = y;
        return input;

        // Submit Button
        submitBtn = new TextField();
        submitBtn.text = "Submit";
        submitBtn.border = true;
        submitBtn.background = true;
        submitBtn.selectable = false;
        submitBtn.width = 100;
        submitBtn.height = 30;
        submitBtn.x = 50;
        submitBtn.y = 100;
        submitBtn.defaultTextFormat = new TextFormat("Arial", 16, 0x000000, true);
        submitBtn.addEventListener(MouseEvent.CLICK, onSubmit);
        addChild(submitBtn);

        // Result Box
        resultBox = new TextField();
        resultBox.width = 400;
        resultBox.height = 400;
        resultBox.x = 50;
        resultBox.y = 150;
        resultBox.border = true;
        resultBox.multiline = true;
        resultBox.wordWrap = true;
        resultBox.defaultTextFormat = new TextFormat("Arial", 14);
        addChild(resultBox);
    }

    function onSubmit(e:MouseEvent):Void {
        // resultBox.text += "- " + input.text + "\n";
        // input.text = "";

		var data = new URLVariables();
        data.text = input.text;

        var request = new URLRequest("https://your-api-endpoint.com/save");
        request.method = URLRequestMethod.POST;
        request.data = data;

        var loader = new URLLoader();
        loader.load(request);

        resultBox.text = "Saving: " + input.text;
    }
}
