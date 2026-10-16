import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Builds Task Ledger into a single self-contained HTML file.
 *
 * Reads src/index.html and inlines every local stylesheet and script:
 *   - <link rel="stylesheet" href="css/x.css">  becomes one <style> block
 *   - <script src="js/x.js"></script>           becomes one <script>, files joined
 *                                               in order and wrapped in a function scope
 *
 * External URLs (such as Google Fonts) are left untouched.
 *
 * Usage (JDK 11 or newer, no compile step and no dependencies):
 *   java Build.java [output-file]        default output: docs/index.html
 */
public class Build {

    private static final Path ROOT = Paths.get("").toAbsolutePath();
    private static final Path SRC = ROOT.resolve("src");

    private static final Pattern LINK = Pattern.compile(
            "[ \\t]*<link\\s+rel=\"stylesheet\"\\s+href=\"(?!https?:|//)([^\"]+)\"\\s*/?>[ \\t]*\\n?");
    private static final Pattern SCRIPT = Pattern.compile(
            "[ \\t]*<script\\s+src=\"(?!https?:|//)([^\"]+)\"\\s*></script>[ \\t]*\\n?");

    public static void main(String[] args) throws IOException {
        if (!Files.isDirectory(SRC)) {
            fail("run this from the repository root (src/ not found)");
        }
        Path out = ROOT.resolve(args.length > 0 ? args[0] : "docs/index.html");
        String result = build(read("index.html"));
        if (out.getParent() != null) {
            Files.createDirectories(out.getParent());
        }
        Files.write(out, result.getBytes(StandardCharsets.UTF_8));
        System.out.printf("built %s  (%.1f KB)%n", ROOT.relativize(out), result.getBytes(StandardCharsets.UTF_8).length / 1024.0);
    }

    private static String build(String html) throws IOException {
        // 1. Stylesheets: one combined <style> at the position of the first local <link>.
        List<String> cssFiles = matches(LINK, html);
        if (!cssFiles.isEmpty()) {
            StringBuilder css = new StringBuilder();
            for (String name : cssFiles) {
                css.append("/* ").append(name).append(" */\n").append(read(name)).append('\n');
            }
            css.setLength(css.length() - 1);
            html = replaceFirstThenStrip(LINK, html, "  <style>\n" + css + "  </style>\n");
        }

        // 2. Scripts: one combined <script>, wrapped in a function scope.
        List<String> jsFiles = matches(SCRIPT, html);
        if (!jsFiles.isEmpty()) {
            StringBuilder js = new StringBuilder();
            for (String name : jsFiles) {
                js.append("/* ").append(name).append(" */\n").append(read(name)).append('\n');
            }
            js.setLength(js.length() - 1);
            String script = "  <script>\n(function () {\n'use strict';\n\n" + js + "})();\n  </script>\n";
            html = replaceFirstThenStrip(SCRIPT, html, script);
        }
        return html;
    }

    private static List<String> matches(Pattern p, String text) {
        List<String> found = new ArrayList<>();
        Matcher m = p.matcher(text);
        while (m.find()) {
            found.add(m.group(1));
        }
        return found;
    }

    /** Puts the replacement where the first match was, and removes every other match. */
    private static String replaceFirstThenStrip(Pattern p, String text, String replacement) {
        Matcher m = p.matcher(text);
        if (!m.find()) {
            return text;
        }
        String head = text.substring(0, m.start());
        String tail = text.substring(m.end());
        return head + replacement + p.matcher(tail).replaceAll("");
    }

    private static String read(String relative) throws IOException {
        Path file = SRC.resolve(relative);
        if (!Files.isRegularFile(file)) {
            fail("missing file referenced in index.html: src/" + relative);
        }
        String text = new String(Files.readAllBytes(file), StandardCharsets.UTF_8);
        return text.replaceAll("\\s+$", "") + "\n";
    }

    private static void fail(String message) {
        System.err.println("build: " + message);
        System.exit(1);
    }
}
