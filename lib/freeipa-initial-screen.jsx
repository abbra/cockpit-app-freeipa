import React from "react";
import $ from "jquery";

import cockpit from "cockpit";
import utils from "freeipa-utils.jsx"
import Status from "freeipa-status.jsx"
import setup from "freeipa-setup.jsx"

function show_setup(setup_type, self, event) {
        setup.setup_dialog(setup_type, () => {
            self.update_status();
        });
}

var initial_screen = {
    initial_master: {
        description: "FreeIPA master needs to be set up before it can be used",
        label: "master",
        action_label: "Run initial master setup",
    },
    install_client: {
        description: "This machine is not enrolled to FreeIPA. It can be enrolled into an existing environment.",
        label: "client",
        action_label: "Run initial client setup",
    },
    new_replica: {
        description: "This machine is enrolled to FreeIPA already. It can be promoted to a replica.",
        label: "replica",
        action_label: "Promote to a replica",
    },
};

class InitialStatus extends React.Component {
    constructor() {
        super();
        this.state = { status: null, action: null };
    }

    componentDidMount() {
        this.update_status();
    }

    update_status() {
        this.setState({ status: { running: true } });
        cockpit.spawn([ "/usr/libexec/cockpit-app-freeipa-check-install" ],
                      { superuser: null, err: "message" })
            .done(output => {
                var state = JSON.parse(output);
                switch (state.result) {
                case 'NOT_CONFIGURED':
                    this.setState({ 
                        status: { running: false,
                                  needs_config: true,
                                  initial_master: true,
                                  install_client: true,
                                  new_replica: false }
                    });
                break;
                case 'CLIENT_CONFIGURED':
                    this.setState({
                        status: { running: false,
                                  needs_config: true,
                                  initial_master: false,
                                  install_client: false,
                                  new_replica: true}
                    });
                break;
                case 'SERVER_CONFIGURED':
                    this.setState({
                        status: { running: false, needs_config: false }
                    });
                break;
                }
            })
            .fail((error) => {
                if (error.exit_status == -127) {
                    this.setState({
                        status: { running: false,
                                  needs_config: true,
                                  initial_master: true,
                                  install_client: true,
                                  new_replica: false }
                    });
                } else {
                    this.setState({ status: { failure: error.message } });
                }
            });
    }

    render() {
        var self = this;
        var status = this.state.status;

        function InitialScreenElement(props) {
            const element = props.element.element;
            if (props.element.enabled)
                return (
                    <div className="setup-message">
                        <p>{element.description}</p>
                        <p><button className="btn btn-primary"
                                   onClick={utils.left_click(element.label, show_setup, self)}>
                            {element.action_label}
                        </button></p>
                    </div>
                );
            return null;
        }

        if (!status || status.running)
            return <div className="spinner spinner-lg status-spinner"/>;

        if (status.needs_config) {
            var n = [ {enabled: status.initial_master, element: initial_screen.initial_master},
                      {enabled: status.new_replica, element: initial_screen.new_replica},
                      {enabled: status.install_client, element: initial_screen.install_client},
                    ];
            return (
                <center className="setup-message">
                    <p><img src="logo-big.png"/></p>
                    {n.map((element) =>
                        <InitialScreenElement element={element} />
                    )}
                </center>
            );
        } else {
            return (
                <center className="setup-message">
                    <p><img src="logo-big.png"/></p>
                    <p>This machine is a FreeIPA replica.</p>
                    <div className="container-fluid">
                        <Status.Status/>
                    </div>
                </center>
            );
        }
    }
}

module.exports = {
    InitialStatus: InitialStatus,
};
