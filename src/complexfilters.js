import React from 'react';
import './complexfilters.css';

class ComplexFilters extends React.Component {

    constructor(props) {
        super(props);

        /* Storing the states have passed
         * as an object with 3 properties: 1.field 2.value 3.key
         * Type: StackArray
         * Perspective: [
         *               {field: "..." ,value: "..." ,key: "..." },
         *               {field: "..." ,value: "..." ,key: "..." },
         *               .
         *               .
         *               .
         *              ]
         */
        this.inputState = [];


        /* Storing validated grammar
         * in validated grammar: 1. validator function run on it
         *                       2. instead of group name of children in value of children key they have array of children label
         * Type: Object
         * Perspective: {
         *               key1: {children: [child key 1, child key 2,...],...},
         *               key2: {children: [child key 1, child key 2,...],...},
         *               .
         *               .
         *               .
         *              }
         */
        this.validGrammar = {};


        /* Storing all grouped and not grouped grammar nodes that have *label*
         * based on their group names (key: groupName, value: [object1, object2 ,...])
         * if not grouped, storing in assumed group name "_" -> (key: "_", value: [object1, object2 ,...])
         * Type: Object
         * Perspective: {
         *               groupName1: [object1, object2 ,...],
         *               groupName2: [object1, object2 ,...],
         *               .
         *               .
         *               .
         *               "_": [object1, object2 ,...]
         *              }
         *              //Objects have two property: 1.label 2. key of the node
         */
        this.groupHash = null;

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

        //calling this function only once in whole here to set "settings" by props
        this.setSettings();

        let grammar = this.getGrammar(true);


        this.state = {

            //for storing filter box list(tokens)
            tokenItems: [
                [
                    {
                        field: "column",
                        key: "text",
                        value: "text"
                    },
                    {
                        field: "operator",
                        key: "neq",
                        value: "neq"
                    },
                    {
                        field: "value",
                        key: "value",
                        value: "12"
                    }
                ],
                [
                    {
                        field: "column",
                        key: "text",
                        value: "text"
                    },
                    {
                        field: "operator",
                        key: "eq",
                        value: "eq"
                    },
                    {
                        field: "value",
                        key: "value",
                        value: "12"
                    }
                ]

            ],

            showSuggestedItems: false,

            //Storing the current node of grammar
            currentNode : grammar[this.settings.startNode],

            // //for storing suggestions list
            // suggestedItems: {
            //     "_": [],
            //     "columns": [
            //         {
            //             label: "Time column",
            //             value: "time"
            //         },
            //         {
            //             label: "Text column",
            //             value: "text"
            //         },
            //         {
            //             label: "Key Value Column",
            //             value: "key-value"
            //         }
            //     ]
            // },
        };


    }


    /*
     * it does two job:
     * 1. at first "settings" variable need to be initialize with "props.options"
     * 2. secondly check if all grammar nodes have default style of grammar node and complete them
     * returns: changed "settings" variable
     */
    setSettings = () => {

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
            this.settings.grammar[node] = Object.assign({}, defaultNode, grammarNode);
        }
        // now "setting.grammar" have nodes in defaultNode style

    };

    /*
    * we have following steps here if we have force:
    * 1. create an options object that has two property: 1. grammar(state grammar)
    *                                                    2. inputState(global "inputState" contain followed states)
    * 2. validate new options by calling it's "validateGrammar" function "this.settings" and send it as parameter
    * 3. calls "makeGroupHash" function for validated grammar returns from previous step to grouping grammar nodes
    * 4. calls "makeGroupChildren" function for validated grammar to specify it's children
    * 5. make this grammar as "validGrammar"
    * parameters: force(Boolean) -> if true validate grammar by mentioned steps else return global "validGrammar"
    * return: sets global "validGrammar" variable
    */
    getGrammar = (force=false) =>{
        if (force) {
            const options = {
                grammar: this.settings.grammar,
                inputState: this.inputState
            };
            let validatedGrammar = this.settings.validateGrammar(options);
            this.makeGroupHash(validatedGrammar);
            validatedGrammar = this.makeGroupChildren(validatedGrammar);
            this.validGrammar = validatedGrammar;
        }
        return this.validGrammar;
    };

    /* grouping grammar nodes that have *label* based on their group names
     * parameters: validatedGrammar(Object) -> grammar that Already validated
     * return: sets global "groupHash" variable
     */
    makeGroupHash = (validatedGrammar) =>{
        // "_" group name for ungrouped nodes
        this.groupHash = {
            "_": []
        };

        //Iterate over the nodes in validated grammar
        for (let keyNode in validatedGrammar) {
            let grammarNode = validatedGrammar[keyNode];
            let grammarNodeLabel = getHybrid(grammarNode.label);

            //Create an object contain two property for storing node in their group
            let groupItem = {
                label: grammarNodeLabel,
                value: keyNode
            };

            /* if node have label then:
             *     1. if node doesn't have group -> put it in "_" group
             *     2. else:
             *          1. if "groupHash" has node group name ->  put it in it's group
             *          2. else -> create new group named node group name and put it in it's group
             */
            if (grammarNodeLabel) {
                if (grammarNode.group === undefined) {
                    this.groupHash["_"].push(groupItem);
                } else {
                    if (grammarNode.group in this.groupHash) {
                        this.groupHash[grammarNode.group].push(groupItem);
                    } else {
                        this.groupHash[grammarNode.group] = [groupItem];
                    }
                }
            }
        }
    };

    /* Replace the group name of children in *children* property of grammar nodes with their own names
     * parameters: validatedGrammar(Object) -> grammar that validator function run on it
     * return: validatedGrammar(Object) -> validated grammar with changes on it's nodes children property
     */
    makeGroupChildren = (validatedGrammar) =>{
        /* Iterate over the nodes in "validatedGrammar" then
         * iterate over the child node of main node then:
         *     1. if child node specified with it's own name -> leave it
         *     2. else if child node specifies the group of nodes ->
         *          find the group name in global "groupHash" and replace group name in main node with
         *          it's element(grammar nodes of same group) in global "groupHash" variable
         */
        for (let keyNode in validatedGrammar) {
            var grammarNode = validatedGrammar[keyNode];
            var realChildren = [];
            for (let child of grammarNode.children) {
                //Dont know child[1]?????????
                if (child[0] === '$' && child[1] !== '$') {
                    if (child.substr(1) in this.groupHash) {
                        let groupFields = this.groupHash[child.substr(1)];
                        for (let field of groupFields) {
                            realChildren.push(field.value);
                        }
                    }
                } else {
                    realChildren.push(child);
                }
            }
            validatedGrammar[keyNode]["children"] = realChildren;
        }

        //Return changed validated grammar
        return validatedGrammar
    };

    /*
     * handling events of inputWidget HTMLElement
     * Parameters: event
     * Events handle: focus, blur
     */
    inputWidgetEventHandler = (event) => {
        event.preventDefault();

        if (event.type === "focus") {

            //Show suggestions dropdown
            this.setState({showSuggestedItems: true});
        } else if (event.type === "blur") {

            //Hide suggestions dropdown
            this.setState({showSuggestedItems: false});
        }
    };

    /* Close token when click on it's close icon "X"
     * token is inside of "li" widget with className "token-item"
     * Parameters: event
     * Events handle: click
     */
    closeTokenItemEventHandler = (event) => {
        event.preventDefault();

        /* get "li" widget by accessing the parent of event target
         * and then call the remove function of HTMLElement to remove it's node from DOM
         */
        // event.target.parentElement.remove();
        let tokenItems = this.state.tokenItems.slice();
        tokenItems.splice(event.target.getAttribute("data-key"), 1);
        this.setState({tokenItems: tokenItems })
    };

    suggestionsEventHandler = (event) => {
        event.preventDefault();

        let grammar = this.getGrammar();
        this.setState({currentNode : grammar[event.target.getAttribute("value")]});
    };

    // rendering "tokenItems" as HTMLElement
    renderTokenItems = () => {

        let grammar = this.getGrammar();

        return this.state.tokenItems.map((token, indexList) => {
            let outValues = token.map((outValue, indexSpans) => {
                let outValueLabel;
                for (let keyNode in grammar) {
                    if (outValue.key === 'value')
                        outValueLabel = outValue.value;
                    else if (outValue.key === keyNode)
                        outValueLabel = grammar[keyNode].label;
                }
                // if (outValueLabel !== undefined)
                return <span key={indexList + "." + indexSpans}>{outValueLabel}</span>;
            });
            outValues.push(
                <span
                    key={outValues.length}
                    data-key={indexList}
                    className={this.settings.classNames.tokenItemCloseClass}
                    onClick={this.closeTokenItemEventHandler}
                > X</span>
            );
            return (
                //should check if null or not?
                <li key={indexList}
                    className={this.settings.classNames.tokenItemClass}
                    >
                    {outValues}
                </li>
            )
        })

    };

    renderInputWidget = () => {

        let inputWidgetType = this.state.currentNode.widget;
        if (inputWidgetType === "textWidget")
            inputWidgetType = "text";
        else if (inputWidgetType === "timeWidget")
            inputWidgetType = "time";
        return (
            <input
                type={inputWidgetType}
                onFocus={this.inputWidgetEventHandler}
                onBlur={this.inputWidgetEventHandler}/>
        );
    };

    makeSuggestedItems = () => {

        let grammar = this.getGrammar();

        // "_" group name for ungrouped node
        let suggestedItemList = {
            "_": []
        };
        for (let child of this.state.currentNode.children) {
            var grammarNode = grammar[child];
            var grammarNodeLabel = getHybrid(grammarNode.label);
            if (grammarNodeLabel) {
                let groupItem = {
                    label: grammarNodeLabel,
                    value: child
                };

                if (grammarNode.group === undefined) {
                    suggestedItemList["_"].push(groupItem);
                } else {
                    if (grammarNode.group in suggestedItemList) {
                        suggestedItemList[grammarNode.group].push(groupItem);
                    } else {
                        suggestedItemList[grammarNode.group] = [groupItem];
                    }
                }
            }
        }

        return suggestedItemList;
    };

    // rendering "suggestedItem" as HTMLElement
    renderSuggestedItems = () => {

        let suggestedItemList = this.makeSuggestedItems();

        let suggestedItems = [];
        if (this.state.showSuggestedItems) {
            for (let groupName in suggestedItemList) {
                if (groupName !== "_") {
                    suggestedItems.push(
                        <li key={groupName}
                            className={this.settings.classNames.suggestedItemClass +
                            " " + this.settings.classNames.suggestedGroupClass}
                        >
                            {groupName}
                        </li>
                    );
                }
                suggestedItems.push(suggestedItemList[groupName].map((groupChild) => {
                        let className = this.settings.classNames.suggestedItemClass +
                            " " + this.settings.classNames.suggestedNodeClass;

                        if (groupName !== "_") {
                            className += " " + this.settings.classNames.suggestedGroupItemClass;
                        }

                        return (
                            <li key={groupName + " " + groupChild.value}
                                value={groupChild.value}
                                className={className}
                                onMouseDown={this.suggestionsEventHandler}
                            >
                                {groupChild.label}
                            </li>
                        )
                    }
                ));
            }
        }
        return suggestedItems;
    };


    render() {

        return (
            <div className={this.settings.classNames.containerClass}>
                <ul className={this.settings.classNames.filterBoxClass}>
                    {this.renderTokenItems()}
                    {/*can be written with ListItem component*/}
                    <li className={this.settings.classNames.inputBoxClass}>
                        {/*for storing main input widget*/}
                        {this.renderInputWidget()}
                    </li>
                </ul>
                <ul className={this.settings.classNames.suggestionsClass}>
                    {this.renderSuggestedItems()}
                </ul>
            </div>
        );
    }

}

function getHybrid(obj, value) {
    if (obj instanceof RegExp) {
        return obj.test(value);
    }
    return (typeof obj == "function")? obj(value): obj;
}

export default ComplexFilters;
