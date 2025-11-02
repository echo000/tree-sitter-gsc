package tree_sitter_gsc_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	"github.com/tree-sitter/tree-sitter-gsc"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_gsc.Language())
	if language == nil {
		t.Errorf("Error loading Gsc grammar")
	}
}
