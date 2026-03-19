const { serve } = Bun;
const dist = import.meta.dir + "/dist";

serve({
  port: 8080,
  hostname: "0.0.0.0",
  async fetch(req) {
    const url = new URL(req.url);
    let path = url.pathname === "/" ? "/index.html" : url.pathname;
    const file = Bun.file(dist + path);
    if (await file.exists()) {
      return new Response(file);
    }
    return new Response(Bun.file(dist + "/index.html"));
  },
});
