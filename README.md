# Tree-sitter Grammar for GSC (Game Script Code)

A tree-sitter grammar for GSC (Game Script Code) and CSC (Client Script Code) - the scripting languages used in Call of Duty: Black Ops III.

## Status

⚠️ **Work in Progress** - This grammar is in early development and may not parse all valid GSC code correctly yet.

## What is Tree-sitter?

[Tree-sitter](https://tree-sitter.github.io/) is a parser generator tool and incremental parsing library. It builds a concrete syntax tree for source files and updates the tree efficiently as the source file is edited.

## Features

This grammar supports:

- ✅ Function definitions (with `private` and `autoexec` modifiers)
- ✅ Class definitions (with inheritance)
- ✅ Preprocessor directives (`#using`, `#namespace`, `#define`, etc.)
- ✅ Control flow (`if`, `while`, `for`, `foreach`, `switch`)
- ✅ GSC-specific keywords (`wait`, `waittill`, `endon`, `notify`, `thread`)
- ✅ Namespace resolution (`namespace::function()`)
- ✅ Function pointers (`&function`)
- ✅ Member access (`.` and `->` operators)
- ✅ Built-in variables (`self`, `level`, `game`, `world`, `anim`)
- ✅ Comments (line and block)
- ✅ Operators and expressions

## Building the Grammar

### Prerequisites

1. **Node.js** (v16 or higher)
2. **npm** or **yarn**
3. **tree-sitter CLI**:
   ```bash
   npm install -g tree-sitter-cli
   ```

### Build Steps

```bash
# Navigate to the grammar directory
cd grammars/gsc

# Install dependencies
npm install

# Generate the parser
tree-sitter generate

# Test the grammar
tree-sitter test

# Build WebAssembly binary (for web editors)
tree-sitter build --wasm
```

## Testing

Create test files in `test/corpus/` and run:

```bash
tree-sitter test
```

Example test file format (`test/corpus/functions.txt`):

```
==================
Simple function
==================

function test()
{
    return true;
}

---

(source_file
  (function_definition
    name: (identifier)
    parameters: (parameter_list)
    body: (block
      (return_statement
        (boolean_literal)))))
```

## Integration with Zed

Once the grammar is built, you can integrate it with your Zed extension:

1. Build the grammar:
   ```bash
   tree-sitter generate
   tree-sitter build --wasm
   ```

2. The generated files will be in:
   - `src/parser.c` - The parser implementation
   - `src/node-types.json` - Node type definitions
   - `tree-sitter-gsc.wasm` - WebAssembly binary

3. Update your Zed extension to reference the grammar (see main extension README)

## Syntax Highlighting

The grammar includes a `queries/highlights.scm` file that defines syntax highlighting rules. This file maps grammar nodes to semantic highlighting scopes.

Example highlights:
- Keywords: `function`, `class`, `if`, `while`, etc.
- Built-ins: `self`, `level`, `wait`, `notify`, etc.
- Operators: `+`, `-`, `==`, `&&`, etc.
- Preprocessor: `#using`, `#namespace`, `#define`, etc.

## Example Code

The grammar can parse code like:

```gsc
#using scripts\shared\util_shared;
#namespace mymap;

function autoexec main()
{
    level.myvar = "test";
    thread init_players();
}

function private init_players()
{
    foreach(player in level.players)
    {
        player endon("disconnect");
        player waittill("spawned");
        player thread watch_damage();
    }
}

class MyClass : BaseClass
{
    var member_var;
    
    constructor(param)
    {
        self.member_var = param;
    }
}
```

## Contributing

This grammar is based on the TextMate grammar from [GSCode](https://github.com/Blakintosh/gscode).

To contribute:

1. Add test cases for GSC language features
2. Improve the grammar rules
3. Fix parsing errors
4. Update highlight queries

### Known Issues

- [ ] Macro expansion not fully supported
- [ ] Some edge cases in expression parsing
- [ ] Dev blocks (`/#` ... `#/`) not parsed
- [ ] Documentation comments (`/@` ... `@/`) not parsed

## Resources

- [Tree-sitter Documentation](https://tree-sitter.github.io/tree-sitter/)
- [Creating Parsers Guide](https://tree-sitter.github.io/tree-sitter/creating-parsers)
- [GSCode Repository](https://github.com/Blakintosh/gscode)
- [Black Ops III GSC Documentation](https://wiki.modme.co/wiki/black_ops_3/Getting_Started_with_Scripting.html)

## License

GPL-3.0 - Same as GSCode

```
GSCode - Black Ops III GSC Language Extension
Copyright (C) 2025 Blakintosh

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
```
