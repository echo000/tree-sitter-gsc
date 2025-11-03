/**
 * Tree-sitter grammar for GSC (Game Script Code) - Call of Duty: Black Ops III
 * Based on the TextMate grammar from https://github.com/Blakintosh/gscode
 */

module.exports = grammar({
  name: "gsc",

  extras: ($) => [/\s/, $.comment, $.dev_block, $.doc_comment],

  word: ($) => $.identifier,

  conflicts: ($) => [
    [$.new_expression, $.call_expression],
    [$._expression, $.assignment_expression],
    [$.subscript_expression, $.array_literal],
    [$.pointer_call_expression, $.call_expression],
    [$.vector_literal, $.parenthesized_expression],
  ],

  rules: {
    source_file: ($) => repeat($._statement),

    _statement: ($) =>
      choice(
        $.preprocessor_directive,
        $.function_definition,
        $.class_definition,
        $.expression_statement,
        $.control_statement,
        $.const_statement,
        $.var_statement,
        $.return_statement,
        $.wait_statement,
        $.notify_statement,
        $.endon_statement,
        $.waittill_statement,
        $.waittillframeend_statement,
        $.dev_block,
        $.doc_comment,
        $.block,
        ";",
      ),

    // Preprocessor directives
    preprocessor_directive: ($) =>
      choice(
        $.preprocessor_using,
        $.preprocessor_insert,
        $.preprocessor_namespace,
        $.preprocessor_define,
        $.preprocessor_precache,
        $.preprocessor_using_animtree,
        $.preprocessor_conditional,
      ),

    preprocessor_using: ($) =>
      seq("#using", field("path", $.preprocessor_path), ";"),

    preprocessor_insert: ($) =>
      seq("#insert", field("path", $.preprocessor_path), ";"),

    preprocessor_namespace: ($) =>
      seq("#namespace", field("name", $.identifier), ";"),

    preprocessor_define: ($) =>
      seq(
        "#define",
        field("name", $.identifier),
        optional($.macro_parameter_list),
        field("value", optional($.macro_body)),
        /\r?\n/,
      ),

    macro_parameter_list: ($) => token(seq("(", /[^)]*/, ")")),

    macro_body: ($) =>
      repeat1(
        choice(
          /[^\\\n]+/,
          seq("\\", /\r?\n/), // line continuation
        ),
      ),

    preprocessor_precache: ($) =>
      seq("#precache", "(", $.string_literal, ",", $.string_literal, ")", ";"),

    preprocessor_using_animtree: ($) =>
      seq("#using_animtree", "(", $.string_literal, ")", ";"),

    preprocessor_conditional: ($) =>
      choice(
        seq("#if", $._expression),
        seq("#elif", $._expression),
        "#else",
        "#endif",
      ),

    // Function definition
    function_definition: ($) =>
      seq(
        "function",
        optional(field("modifier", choice("private", "autoexec"))),
        field("name", $.identifier),
        field("parameters", $.parameter_list),
        field("body", $.block),
      ),

    parameter_list: ($) =>
      seq(
        "(",
        optional(
          commaSep1(choice($.identifier, $.parameter_default, $.vararg)),
        ),
        ")",
      ),

    parameter_default: ($) =>
      seq(field("name", $.identifier), "=", field("default", $._expression)),

    vararg: ($) => "...",

    // Class definition
    class_definition: ($) =>
      seq(
        "class",
        field("name", $.identifier),
        optional(seq(":", field("parent", $.identifier))),
        field("body", $.class_body),
      ),

    class_body: ($) =>
      seq(
        "{",
        repeat(
          choice(
            $.variable_declaration,
            $.constructor_definition,
            $.destructor_definition,
            $.function_definition,
          ),
        ),
        "}",
      ),

    constructor_definition: ($) =>
      seq(
        "constructor",
        field("parameters", $.parameter_list),
        field("body", $.block),
      ),

    destructor_definition: ($) =>
      seq(
        "destructor",
        field("parameters", $.parameter_list),
        field("body", $.block),
      ),

    variable_declaration: ($) =>
      seq("var", $.identifier, optional(seq("=", $._expression)), ";"),

    // Statements
    control_statement: ($) =>
      choice(
        $.if_statement,
        $.while_statement,
        $.for_statement,
        $.foreach_statement,
        $.switch_statement,
        $.do_while_statement,
        $.break_statement,
        $.continue_statement,
      ),

    const_statement: ($) =>
      seq(
        "const",
        field("name", $.identifier),
        "=",
        field("value", $._expression),
        ";",
      ),

    var_statement: ($) =>
      seq("var", $.identifier, optional(seq("=", $._expression)), ";"),

    if_statement: ($) =>
      seq(
        "if",
        "(",
        field("condition", $._expression),
        ")",
        field("consequence", $.block),
        optional(
          seq("else", field("alternative", choice($.block, $.if_statement))),
        ),
      ),

    while_statement: ($) =>
      seq(
        "while",
        "(",
        field("condition", $._expression),
        ")",
        field("body", $.block),
      ),

    do_while_statement: ($) =>
      prec.right(
        1,
        seq(
          "do",
          field("body", $.block),
          "while",
          "(",
          field("condition", $._expression),
          ")",
          ";",
        ),
      ),

    for_statement: ($) =>
      seq(
        "for",
        "(",
        field(
          "initializer",
          optional(choice($._expression, $.variable_declaration)),
        ),
        ";",
        field("condition", optional($._expression)),
        ";",
        field("update", optional($._expression)),
        ")",
        field("body", $.block),
      ),

    foreach_statement: ($) =>
      seq(
        "foreach",
        "(",
        field("element", $.identifier),
        "in",
        field("collection", $._expression),
        ")",
        field("body", $.block),
      ),

    switch_statement: ($) =>
      seq(
        "switch",
        "(",
        field("value", $._expression),
        ")",
        "{",
        repeat(choice($.case_statement, $.default_statement)),
        "}",
      ),

    case_statement: ($) =>
      seq("case", field("value", $._expression), ":", repeat($._statement)),

    default_statement: ($) => seq("default", ":", repeat($._statement)),

    break_statement: ($) => seq("break", ";"),
    continue_statement: ($) => seq("continue", ";"),

    return_statement: ($) => seq("return", optional($._expression), ";"),

    wait_statement: ($) =>
      seq(choice("wait", "waitrealtime"), $._expression, ";"),

    waittillframeend_statement: ($) =>
      seq("waittillframeend", optional($._expression), ";"),

    notify_statement: ($) =>
      seq(
        field("object", $._expression),
        "notify",
        "(",
        field("event", $._expression),
        optional(seq(",", commaSep1($._expression))),
        ")",
        ";",
      ),

    endon_statement: ($) =>
      seq(
        field("object", $._expression),
        "endon",
        "(",
        field("event", $._expression),
        ")",
        ";",
      ),

    waittill_statement: ($) =>
      seq(
        field("object", $._expression),
        choice("waittill", "waittillmatch"),
        "(",
        field("event", $._expression),
        optional(seq(",", commaSep1($.identifier))),
        ")",
        ";",
      ),

    expression_statement: ($) => seq($._expression, ";"),

    block: ($) => seq("{", repeat($._statement), "}"),

    // Expressions
    _expression: ($) =>
      choice(
        $.anim_reference,
        $.anim_identifier,
        $.identifier,
        $.number,
        $.string_literal,
        $.istring_literal,
        $.hash_string_literal,
        $.boolean_literal,
        $.undefined_literal,
        $.animtree_literal,
        $.array_literal,
        $.vector_literal,
        $.parenthesized_expression,
        $.binary_expression,
        $.unary_expression,
        $.assignment_expression,
        $.update_expression,
        $.call_expression,
        $.pointer_call_expression,
        $.member_expression,
        $.subscript_expression,
        $.thread_expression,
        $.function_pointer,
        $.function_dereference,
        $.ternary_expression,
        $.new_expression,
        $.isdefined_expression,
        $.builtin_variable,
      ),

    parenthesized_expression: ($) => seq("(", $._expression, ")"),

    binary_expression: ($) =>
      choice(
        prec.left(1, seq($._expression, "||", $._expression)),
        prec.left(2, seq($._expression, "&&", $._expression)),
        prec.left(3, seq($._expression, "|", $._expression)),
        prec.left(4, seq($._expression, "^", $._expression)),
        prec.left(5, seq($._expression, "&", $._expression)),
        prec.left(
          6,
          seq($._expression, choice("==", "===", "!=", "!=="), $._expression),
        ),
        prec.left(
          7,
          seq($._expression, choice("<", ">", "<=", ">="), $._expression),
        ),
        prec.left(8, seq($._expression, choice("<<", ">>"), $._expression)),
        prec.left(9, seq($._expression, choice("+", "-"), $._expression)),
        prec.left(10, seq($._expression, choice("*", "/", "%"), $._expression)),
      ),

    unary_expression: ($) =>
      prec.right(11, seq(choice("!", "~", "-", "+"), $._expression)),

    assignment_expression: ($) =>
      prec.right(
        0,
        seq(
          field("left", $._expression),
          field(
            "operator",
            choice(
              "=",
              "+=",
              "-=",
              "*=",
              "/=",
              "%=",
              "&=",
              "|=",
              "^=",
              "<<=",
              ">>=",
            ),
          ),
          field("right", $._expression),
        ),
      ),

    update_expression: ($) =>
      choice(
        prec.left(12, seq($._expression, choice("++", "--"))),
        prec.right(12, seq(choice("++", "--"), $._expression)),
      ),

    call_expression: ($) =>
      prec(
        13,
        seq(
          field(
            "function",
            choice($.identifier, $.namespace_call, $.member_expression),
          ),
          field("arguments", $.argument_list),
        ),
      ),

    pointer_call_expression: ($) =>
      prec(
        13,
        seq(
          field("object", $._expression),
          optional("thread"),
          field(
            "function",
            choice($.identifier, $.namespace_call, $.function_dereference),
          ),
          field("arguments", $.argument_list),
        ),
      ),

    namespace_call: ($) =>
      seq(
        field("namespace", $.identifier),
        "::",
        field("function", $.identifier),
      ),

    member_expression: ($) =>
      prec(
        14,
        seq(
          field("object", $._expression),
          choice(".", "->"),
          field("property", $.identifier),
        ),
      ),

    subscript_expression: ($) =>
      prec(
        14,
        seq(
          field("object", $._expression),
          "[",
          field("index", $._expression),
          "]",
        ),
      ),

    argument_list: ($) => seq("(", optional(commaSep1($._expression)), ")"),

    thread_expression: ($) =>
      prec(
        15,
        seq("thread", choice($.call_expression, $.pointer_call_expression)),
      ),

    function_pointer: ($) =>
      seq("&", optional(seq($.identifier, "::")), $.identifier),

    function_dereference: ($) =>
      seq("[[", field("function", $._expression), "]]"),

    ternary_expression: ($) =>
      prec.right(
        0,
        seq(
          field("condition", $._expression),
          "?",
          field("consequence", $._expression),
          ":",
          field("alternative", $._expression),
        ),
      ),

    new_expression: ($) =>
      prec(
        13,
        seq(
          "new",
          field("class", $.identifier),
          field("arguments", $.argument_list),
        ),
      ),

    isdefined_expression: ($) => seq("isdefined", "(", $._expression, ")"),

    array_literal: ($) => seq("[", optional(commaSep1($._expression)), "]"),

    vector_literal: ($) =>
      seq(
        "(",
        field("x", $._expression),
        ",",
        field("y", $._expression),
        ",",
        field("z", $._expression),
        ")",
      ),

    // Preprocessor path (bare path without quotes)
    preprocessor_path: ($) => /[^\s;]+/,

    // Literals and identifiers
    builtin_variable: ($) =>
      choice("self", "level", "game", "world", "anim", "vararg"),

    boolean_literal: ($) => choice("true", "false"),
    undefined_literal: ($) => "undefined",
    animtree_literal: ($) => "#animtree",

    identifier: ($) => /[a-zA-Z_$][a-zA-Z0-9_$]*/,

    anim_identifier: ($) => token(seq("%", /[a-zA-Z_][a-zA-Z0-9_]*/)),

    anim_reference: ($) =>
      seq($.anim_identifier, "::", field("animation", $.identifier)),

    number: ($) =>
      token(
        choice(
          /0[xX][0-9a-fA-F]+/, // hex
          /\d+\.?\d*([eE][+-]?\d+)?/, // decimal/float
        ),
      ),

    string_literal: ($) =>
      seq(
        '"',
        repeat(
          choice(token.immediate(prec(1, /[^"\\\n]+/)), $.escape_sequence),
        ),
        '"',
      ),

    istring_literal: ($) =>
      seq(
        '&"',
        repeat(
          choice(token.immediate(prec(1, /[^"\\\n]+/)), $.escape_sequence),
        ),
        '"',
      ),

    hash_string_literal: ($) =>
      seq(
        '#"',
        repeat(
          choice(token.immediate(prec(1, /[^"\\\n]+/)), $.escape_sequence),
        ),
        '"',
      ),

    escape_sequence: ($) =>
      token.immediate(seq("\\", choice("r", "n", "t", "\\", '"'))),

    // Comments
    comment: ($) =>
      token(
        choice(seq("//", /.*/), seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/")),
      ),

    // Dev blocks
    dev_block: ($) =>
      token(choice(seq("/#", /[^#]*#*([^#\/][^#]*#*)*/, "#/"), "/#", "#/")),

    // Documentation comments
    doc_comment: ($) => token(seq("/@", /[^@]*@*([^@\/][^@]*@*)*/, "@/")),
  },
});

function commaSep1(rule) {
  return seq(rule, repeat(seq(",", rule)), optional(","));
}
