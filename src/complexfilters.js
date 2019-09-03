import React from 'react';

class ComplexFilters extends React.Component{

    constructor(props){
        super(props);
        this.settings = {
            classNames: {
                containerClass: "complexfilters-container",
                filterBoxClass: "filter-box",
                inputBoxClass: "input-box",
                suggestionsClass: "suggestion-drop",
                tokenItemClass: "token-item",
                tokenItemCloseClass: "token-item-close",
                tempTokenItemClass: "temp-token-item",
                suggestedItemClass: "suggested-item",
                suggestedValueClass: "suggested-value",
                suggestedNodeClass: "node-value",
                suggestedGroupItemClass: "group-item",
                suggestedGroupClass: "group-value"
            },
            startNode: null,
            grammar: {},
            validateGrammar: function (options) {
                return options.grammar;
            }
        };

        this.setSetting();

    }

    /*
     * it does two job:
     * 1. at first "settings" variable need to be initialize with "props.options"
     * 2. secondly check if all grammar nodes have default style of grammar node and complete them
     * returns: changed "settings" variable
     */
    setSetting = () =>{

        /* main default style of grammar nodes
         * every grammar nodes should have these properties and function
         */
        let defaultNode = {
            label: false,
            decorate: null,
            group: undefined,
            field: undefined,
            children: [],
            final: false,
            widget: undefined,
            validator: function () {
                return false;
            },
        };

        //merging "setting" by "props.options" and store it in "settings
        Object.assign(this.settings, this.props.options);

        /*
         * now completing the style of "settings.grammar" nodes by "defaultNode" variable
         * do this for all nodes in "settings.grammar" variable => for (node in setOption.grammar){...}
         */
        for (let node in this.settings.grammar) {
            let grammarNode = this.settings.grammar[node];
            this.settings.grammar[node] = Object.assign( {}, defaultNode, grammarNode );
        }
        // now "setting.grammar" have nodes in defaultNode style

    };


    render(){
        console.log(this.settings);
        return (
            <p>
               Complexfilters
            </p>
        );
    }

}

export default ComplexFilters;
