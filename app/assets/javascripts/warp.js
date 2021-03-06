var align_interval;
var overview_card;
$(document).on("turbolinks:load", function() {
  // Go into warp and show warpcard AJAX
  $("#app-container").on("click", ".warp-btn", function(e) {
    e.preventDefault();

    // Give all warp buttons fa-icon
    clearInterval(align_interval);
    $(".warp-btn").each(function() {
      $(this)
        .empty()
        .append("<i class='fa fa-angle-double-right'></i>");
    });

    var button = $(this);
    var html = $(this).html();
    var fleet = button.data("fleet");

    loading_animation($(this));
    var xhr = $.post(
      "game/warp",
      { id: button.data("id"), uid: button.data("uid"), fleet: fleet },
      function(data) {
        if (data.align_time) {
          var align_time = data.align_time;

          button.empty().append(align_time);
          align_interval = setInterval(function() {
            align_time = align_time - 1;
            button.empty().append(align_time);
            if (align_time <= 0) {
              clearInterval(align_interval);
              button.empty().append("<i class='fa fa-angle-double-right'></i>");
              doWarp(10, "WARPING");
            }
          }, 1000);
        } else {
          clearInterval(align_interval);
          button.empty().append("<i class='fa fa-angle-double-right'></i>");
        }
      }
    ).fail(function(data) {
      if (data.responseJSON.error_message) {
        $.notify(data.responseJSON.error_message, { style: "alert" });
      }
      button.html(html);
    });
  });

  // Go into warp and show warpcard AJAX
  $("#app-container").on("click", ".jumpgate-jump-btn", function(e) {
    e.preventDefault();
    var button = $(this);
    var html = $(this).html();
    loading_animation($(this));
    var time = parseInt($(this).data("time"));
    var xhr = $.post("game/jump", function() {
      doWarp(time, "JUMPING");
    }).fail(function(data) {
      if (data.responseJSON.error_message) {
        $.notify(data.responseJSON.error_message, { style: "alert" });
      }
      button.html(html);
    });
  });
});

// Show warpcard
var jump_interval;
var cards;
function doWarp(warpTime, name) {
  if (jump_interval == null || jump_interval == false) {
    remove_target();
    cards = $(".game-card-row").html();
    if (warpTime) {
      $(".game-card-row")
        .empty()
        .append(
          "<div class='col-md-12'><div class='card black-card card-body warp-card mb-3'><h2 class='flexbox-vert-center'>" +
            name +
            "</h2><h4 class='flexbox-vert-center'>" +
            warpTime +
            "</h4></div></div>"
        );
    } else {
      $(".game-card-row")
        .empty()
        .append(
          "<div class='col-md-12'><div class='card black-card card-body warp-card mb-3'><h2 class='flexbox-vert-center mt-3 mb-3' style='margin-bottom:0'>" +
            name +
            "</h2></div></div>"
        );
    }
    pixi_background_speed = 10;
    if (warpTime) {
      jump_interval = setInterval(function() {
        warpTime = warpTime - 0.25;
        if ($(".warp-card").length) {
          $(".game-card-row .warp-card h4")
            .empty()
            .append(Math.round(warpTime));
        } else {
          $(".game-card-row")
            .empty()
            .append(
              "<div class='col-md-12'><div class='card black-card card-body warp-card mb-3'><h2 class='flexbox-vert-center'>" +
                name +
                "</h2><h4 class='flexbox-vert-center'>" +
                Math.round(warpTime) +
                "</h4></div></div>"
            );
        }
        if (warpTime <= 0) {
          clearInterval(jump_interval);
        }
      }, 250);
    }
  }
}

// Remove player from list if warped out
function player_warp_out(name) {
  if ($(".players-card")) {
    $(".players-card-name-td").each(function() {
      if ($(this).html() == name) {
        $(this)
          .closest("tr")
          .fadeOut("fast", function() {
            $(this).remove();
          });
      }
    });
  }
}

// Reload Page
function reload_page() {
  Turbolinks.visit(window.location);
}

// Reload player card AJAX
function reload_players_card(do_load) {
  if ($("#players-card").length) {
    if (do_load) {
      $("#players-card")
        .find(".card-body")
        .html(
          "<h5 class='text-center'><i class='fa fa-spinner fa-spin'></i></h5>"
        );
    }
    $.get("game/local_players", function(data) {
      $("#players-card").replaceWith(data);
    });
  }
}

// Reload player card AJAX
function reload_locations_card(do_load) {
  if ($(".overview-card").length) {
    if (do_load) {
      $(".overview-card")
        .find(".card-body")
        .html(
          "<h5 class='text-center'><i class='fa fa-spinner fa-spin'></i></h5>"
        );
    }
    $.get("game/locations_card", function(data) {
      $(".overview-card").replaceWith(data);
    });
  }
}

// Reload location info
function reload_location_info() {
  if ($(".system-card").length) {
    $.get("game/system_card", function(data) {
      $(".system-card").html(data);
    });
  }
}

// Clear Jump
function clear_jump(local) {
  if (!local) {
    App["local-chat"].unsubscribe();
    App["local-chat"] = null;
  }
  App.local.reload();
  clearInterval(jump_interval);
  jump_interval = false;
  pixi_background_speed = 1;
  if (
    window.location.pathname == "/game" ||
    window.location.pathname == "/station"
  ) {
    if (cards) {
      $(".game-card-row").html(cards);
    }
    if (!local) {
      check_chats();
      reload_local_chat();
    }
    reload_players_card(true);
    reload_locations_card(true);
    reload_location_info();
  }
}

// Warp Disrupted
function warp_disrupted() {
  clearInterval(align_interval);
  $(".warp-btn").each(function() {
    $(this)
      .empty()
      .append("<i class='fa fa-angle-double-right'></i>");
  });
}

// Fleet Warp
function fleet_warp(location_id, align_time) {
  var button;

  // Give all warp buttons fa-icon
  clearInterval(align_interval);

  $(".warp-btn").each(function() {
    if ($(this).data("id") == location_id && $(this).data("fleet")) {
      button = $(this);
    } else {
      $(this)
        .empty()
        .append("<i class='fa fa-angle-double-right'></i>");
    }
  });

  if (button) {
    var width = button.width();
    if (align_time) {
      button.empty().append(align_time);
      button.width(width);
      align_interval = setInterval(function() {
        align_time = align_time - 1;
        button.empty().append(align_time);
        if (align_time <= 0) {
          clearInterval(align_interval);
          button.empty().append("<i class='fa fa-angle-double-right'></i>");
          doWarp(10, "WARPING");
        }
      }, 1000);
    } else {
      clearInterval(align_interval);
      button.width(width);
      button.empty().append("<i class='fa fa-angle-double-right'></i>");
    }
  }
}
