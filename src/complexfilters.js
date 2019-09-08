import React from 'react';
import './complexfilters.css';

class ComplexFilters extends React.Component {

    constructor(props) {
        super(props);

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

            //for storing suggestions list
            suggestedItems: {
                "_": [],
                "columns": [
                    {
                        label: "Time column",
                        value: "time"
                    },
                    {
                        label: "Text column",
                        value: "text"
                    },
                    {
                        label: "Key Value Column",
                        value: "key-value"
                    }
                ]
            },
        };

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
        // console.log(tokenItems);
        this.setState({tokenItems: tokenItems })
    };

    suggestionsEventHandler = (event) => {
        event.preventDefault();
        alert("pop Up");
    };

    // rendering "tokenItem" as HTMLElement
    renderTokenItems = () => {

        //next we can use getGrammar function
        let grammar = this.settings.grammar;

        return this.state.tokenItems.map((token, indexList) => {
            let outValues = token.map((outValue, indexSpans) => {
                let outValueLabel;
                for (let key in grammar) {
                    if (outValue.key === 'value')
                        outValueLabel = outValue.value;
                    else if (outValue.key === key)
                        outValueLabel = grammar[key].label;
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

    // rendering "suggestedItem" as HTMLElement
    renderSuggestedItems = () => {

        let suggestedItems = [];
        if (this.state.showSuggestedItems) {
            for (let groupName in this.state.suggestedItems) {
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
                suggestedItems.push(this.state.suggestedItems[groupName].map((groupChild) => {
                        let className = this.settings.classNames.suggestedItemClass +
                            " " + this.settings.classNames.suggestedNodeClass;

                        if (groupName !== "_") {
                            className += " " + this.settings.classNames.suggestedGroupItemClass;
                        }

                        return (
                            <li key={groupName + " " + groupChild.value}
                                // ? does need now?
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
                        <input
                            type="text"
                            onFocus={this.inputWidgetEventHandler}
                            onBlur={this.inputWidgetEventHandler}/>
                    </li>
                </ul>
                <ul className={this.settings.classNames.suggestionsClass}>
                    {this.renderSuggestedItems()}
                </ul>
            </div>
        );
    }

}

export default ComplexFilters;
