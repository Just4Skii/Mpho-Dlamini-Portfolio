(function () {
  "use strict";

  class App {
    constructor() {
      this.engine = new Engine(
        document.getElementById("canvas-wrap"),
        document.getElementById("view"),
        document.getElementById("overlay")
      );
      this.tools = new Tools(this.engine);
      this.artist = new Artist(this);
      this.plan = null;
      this.sourceImageCanvas = null;
      this.spaceDown = false;

      this.engine.resetDocument(1280, 800);

      this.ui = new UI(this);

      this.engine.addPainter((ctx, eng) => this._paintArtistCursor(ctx, eng));

      window.addEventListener("error", e => {
        if (this.ui && e.message) this.ui.toast("Unexpected error: " + e.message, "error");
      });
      window.addEventListener("beforeunload", e => {
        if (this.engine.canUndo) {
          e.preventDefault();
          e.returnValue = "";
        }
      });

      window.AtelierExternalDriver = {
        stroke(pts, color, size, opacity) {
          this_app.artist._execOpInstant({
            op: "stroke", pts, color, size, opacity, tool: "pen"
          });
        },
        fill(x, y, color, tol) {
          this_app.artist._execOpInstant({ op: "fill", x, y, color, tol });
        },
        pixrun(x, y, len, cell, color) {
          this_app.artist._execOpInstant({ op: "pixrun", x, y, len, cell, color });
        }
      };
      const this_app = this;
    }

    _paintArtistCursor(ctx, eng) {
      const c = this.artist.cursor;
      if (!c.visible) return;
      const p = eng.worldToScreen(c.x, c.y);

      ctx.save();
      for (let i = 0; i < this.artist.trail.length; i++) {
        const t = eng.worldToScreen(this.artist.trail[i].x, this.artist.trail[i].y);
        const a = (i / this.artist.trail.length) * 0.28;
        ctx.fillStyle = `rgba(124,108,255,${a})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 2 + i * 0.22, 0, Math.PI * 2);
        ctx.fill();
      }

      const glow = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, 26);
      glow.addColorStop(0, "rgba(124,108,255,.5)");
      glow.addColorStop(1, "rgba(124,108,255,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 26, 0, Math.PI * 2);
      ctx.fill();

      ctx.translate(p.x, p.y);
      ctx.rotate(c.angle);

      ctx.strokeStyle = "rgba(255,255,255,.95)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-14, -3);
      ctx.quadraticCurveTo(-4, -4, 0, -1.6);
      ctx.lineTo(0, 1.6);
      ctx.quadraticCurveTo(-4, 4, -14, 3);
      ctx.closePath();
      ctx.fillStyle = "rgba(30,34,48,.9)";
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = "rgba(124,108,255,.9)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(2.5, 0, 4.2, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();

      ctx.restore();

      if (c.down) {
        ctx.save();
        ctx.strokeStyle = "rgba(77,214,255,.85)";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  const app = new App();
  window.AtelierApp = app;
})();
