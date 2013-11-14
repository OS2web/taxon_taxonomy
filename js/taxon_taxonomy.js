/*
  File name: taxon_taxonomy.js
  Version:   2.2

  Description:
  taxon_taxonomy is the proxy to allow Drupal to communicate
  with the Taxon system.
*/

/*
  Copyright 2012-13 by Taxon ApS.
  Visit us at www.taxon.dk.

  taxon_taxonomy is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  taxon_taxonomy is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with taxon_taxonomy. If not, see <http://www.gnu.org/licenses/>.

  For more information read the README.txt file in the root directory.
*/
(function ($) {
  Drupal.behaviors.overlay_alter = {
    attach: function (context) {
      // Global settings from Drupal
      var taxonomy_name = Drupal.settings.taxon_taxonomy.taxonomy_name;
      var taxonomy_tag_name = Drupal.settings.taxon_taxonomy.field_name;
      var taxonomy_selected_image = Drupal.settings.taxon_taxonomy.selected_image;
      var taxonomy_not_selected_image = Drupal.settings.taxon_taxonomy.not_selected_image;
      var taxonomy_help_image = Drupal.settings.taxon_taxonomy.help_image;
      var taxonomy_waiticon_image = Drupal.settings.taxon_taxonomy.wait_image;
      var taxonomy_button_text = Drupal.settings.taxon_taxonomy.button_text;
      var taxonomy_button_text_wait = Drupal.settings.taxon_taxonomy.button_text_wait;
      var taxonomy_ckeditor_field = Drupal.settings.taxon_taxonomy.ckeditor_field;
      var taxonomy_help_texts = Drupal.settings.taxon_taxonomy.help_texts;

      // Insert the button, but only once
      var test = $('div').find('#taxon-classify-button');

      if(test.length == 0) {
        $(taxonomy_tag_name).after("<div> <input style = 'margin-top:10px;' id = 'taxon-classify-button' class = 'form-submit ajax-processed' type='button' value='" + taxonomy_button_text + "'></div>");
      }

      // Get the text from the textarea
      $('div').find('#taxon-classify-button').click(function() {
        $('div').find('#taxon-classify-button').attr('value', taxonomy_button_text_wait);
        $('div').find('#taxon-classify-button').after("<img id = 'taxon-wait-cursor' src = '" + taxonomy_waiticon_image + "'>");

        $("#taxon-results").remove();

        CKEDITOR.config.entities = false;
        CKEDITOR.config.entities_latin = false;
        var text = CKEDITOR.instances[taxonomy_ckeditor_field].getData();

        $.ajaxSetup({async:false});

        // Post to the Drupal proxy function and get the result back as text
        $.post("/taxon-taxonomy", { taxonomy: taxonomy_name, text: text }, function(data) {
          $('#taxon-classify-button').before("<div id = 'taxon-results'> </div>");

          var classids_string = $(taxonomy_tag_name).val();

          var classids = classids_string.split(/\s*,\s*/);

          var lines = data.split("\n");

          for(line in lines) {
            if(lines[line] != "") {
              // Get the ID
              var matches = lines[line].match(/^([0-9\.]+)/);

              // For CSS and files names we need to convert . to -
              var id = "";

              if(matches != null)
              {
                id = matches[0];
                id = id.replace(/\./g, "-");
              }

              if(jQuery.inArray(lines[line], classids) != -1) {
                // The classid is selected in the dropdown
                var append_text = "<div class = 'taxon-results-result'><span class = 'taxon-state'><img src = '" + taxonomy_selected_image + "' class = 'state'></span><input style = 'margin-top:10px;' id = 'taxon-classify-" + line + "' class = 'taxon-result' type='button' value='" + lines[line] + "'>";

                if(taxonomy_help_texts != "") {
                  append_text += "<span id = '" + id + "' class = 'taxon-help'><img src = '" + taxonomy_help_image + "' class = 'help'></span></div>";
                }

                $('#taxon-results').append(append_text);
              }
              else {
                // The classid is NOT selected in the dropdown
                var append_text = "<div class = 'taxon-results-result'><span class = 'taxon-state'><img src = '" + taxonomy_not_selected_image + "' class = 'state'></span><input style = 'margin-top:10px;' id = 'taxon-classify-" + line + "' class = 'taxon-result' type='button' value='" + lines[line] + "'>";

                if(taxonomy_help_texts != "") {
                 append_text += "<span id = '" + id + "' class = 'taxon-help'><img src = '" + taxonomy_help_image + "' class = 'help'></span></div>";
                }

                $('#taxon-results').append(append_text);
              }
            }
          }

          $('.taxon-result').click(function() {
            if($(this).siblings("span").children(".state").attr('src') != taxonomy_selected_image) {
              // Add the class
              $(this).siblings("span").children(".state").attr('src', taxonomy_selected_image);
              var classid = $(this).val();

              var classes = $(taxonomy_tag_name).val();

              if(classes == "") {
                $(taxonomy_tag_name).val(classid);
              }
              else {
                $(taxonomy_tag_name).val(classes + "," + classid);
              }
            }
            else {
              // Remove the class
              $(this).siblings("span").children(".state").attr('src', taxonomy_not_selected_image);

              var classid = $(this).val();

              var classes = $(taxonomy_tag_name).val();

              // Start
              var re = new RegExp("^[ ]*" + classid + " *\,? *");
              classes = classes.replace(re, "");

              // Middle
              var re = new RegExp(" *, *" + classid + " *\, *");
              classes = classes.replace(re, ",");

              // End
              var re = new RegExp(" *, *" + classid + " *$");
              classes = classes.replace(re, "");

              $(taxonomy_tag_name).val(jQuery.trim(classes));
            }
          });

          $('.taxon-state').click(function() {
            if($(this).children(".state").attr('src') != taxonomy_selected_image) {
              // Add the class
              $(this).children(".state").attr('src', taxonomy_selected_image);
              var classid = $(this).siblings("input").val();

              var classes = $(taxonomy_tag_name).val();

              if(classes == "") {
                $(taxonomy_tag_name).val(classid);
              }
              else {
                $(taxonomy_tag_name).val(classes + "," + classid);
              }
            }
            else {
              // Remove the class
              $(this).children(".state").attr('src', taxonomy_not_selected_image);

              var classid = $(this).siblings("input").val();

              var classes = $(taxonomy_tag_name).val();

              // Start
              var re = new RegExp("^\s*" + classid + "\s*\,?\s*");
              var classes = classes.replace(re, "");

              // Middle
              var re = new RegExp("\s*,\s*" + classid + "\s*\,\s*");
              var classes = classes.replace(re, ",");

              // End
              var re = new RegExp("\s*,\s*" + classid + "$");
              var classes = classes.replace(re, "");

              $(taxonomy_tag_name).val(classes);
            }
          });

          $('.taxon-help').click(function() {
            var id = $(this).attr('id');
            var position = $(this).position();

            // Display the box a little to the right of the image
            var width = $(this).width() + 30;
            var id_text = $(this).siblings("input").attr('value');

            var url = taxonomy_help_texts + "/" + id + ".html";

            // Get the text for the dialog from the server
            $.ajax({
              type: "GET",
              url: url,
              success: function(data, textStatus){
                var height = 100;

                if(data.length > 500)
                {
                  height = 200;
                }

                if(data.length > 1000)
                {
                  height = 400;
                }

                // Remove all open dialogs
                $(".taxon-help-dialog").remove();

                // Add a div with the text
                $("#" + id).append("<div id = 'dialog-" + id + "' class = 'taxon-help-dialog'><div class = 'taxon-dialog-top'><span id = 'taxon-dialog-close-" + id + "' class = 'taxon-dialog-close' title = 'Close'>X</span></div><h3>" + id_text + "</h3><div class = 'taxon-dialog-body'>" + data + "</div></div>");

                $("#dialog-" + id).css({
                  "top": position.top + "px",
                  "left": (position.left + width) + "px"
                });

                $("#dialog-" + id + " .taxon-dialog-body").css({
                  "height": height + "px",
                });
              },
              error: function(errorObj, textStatus, errorThrown){
                alert("No help text was found.");
              }
            });
          });

          $('.taxon-dialog-close').live('click', function() {
            // Remove the dialog
            var id = $(this).attr('id');

            // We want to close the entire dialog
            id = id.replace("taxon-dialog-close-", "dialog-");

            $("#" + id).remove();
          });
        });

        $('div').find('#taxon-classify-button').attr('value', taxonomy_button_text);
        $('#taxon-wait-cursor').remove();
      });

      $(taxonomy_tag_name).change(function () {
        var classids_string = $(this).val();

        var classids = classids_string.split(/\s*,\s*/);

        $("#taxon-results input").each(function () {
          if(jQuery.inArray($(this).val(), classids) != -1) {
            $(this).siblings("span").children(".state").attr('src', taxonomy_selected_image);
          }
          else {
              $(this).siblings("span").children(".state").attr('src', taxonomy_not_selected_image);
          }
        });
      });
    }
  };
})(jQuery);
