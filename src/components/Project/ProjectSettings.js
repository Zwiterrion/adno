import { Component } from "react";

// Import FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";

// Import SweetAlert
import Swal from "sweetalert2";

// Import CSS 
import "./ProjectSettings.css"

// Add translations
import { withTranslation } from "react-i18next";

import ReactSelect from 'react-select';
import { buildTagsList, insertInLS } from "../../Utils/utils";

class ProjectSettings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            settings: { ...this.props.settings },
        }
    }

    updateProjectSettings = (e) => {
        e.preventDefault()

        this.props.updateSettings(this.state.settings)
        this.props.closeSettings()

        Swal.fire({
            title: this.props.t('modal.settings_updated_success'),
            showCancelButton: false,
            confirmButtonText: 'Ok',
            icon: 'success',
        })
    }

    getAllAnnotationsTags = () => {
        const tags = this.props.annotations
            .flatMap(annotation => buildTagsList(annotation))
            .map(tag => tag.value);

        return [...new Set(tags)].map(tag => ({ value: tag, label: tag }))
    }

    render() {
        const tags = this.getAllAnnotationsTags()

        return (
            <div className="project-metadatas-backdrop">
                <form className="project-metadatas-container" onSubmit={(e) => { this.updateProjectSettings(e) }}>


                    <div className="card-actions justify-end closeBtnMetadatas">
                        <button type="button" className="btn btn-square btn-sm" onClick={() => this.props.closeSettings()}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>


                    <div className="project-metadatas">

                        <label className="label">
                            <span className="label-text">{this.props.t('project.settings.tags')}</span>
                        </label>
                        <ReactSelect
                            isMulti
                            name="tags"
                            options={tags}
                            value={(this.state.settings?.tags || []).map(tag => ({ label: tag, value: tag }))}
                            onChange={newTags => this.setState({ settings: { ...this.state.settings, tags: newTags.map(tag => tag.value) } })}
                            placeholder={this.props.t('annotation.tags_list')}
                            noOptionsMessage={() => this.props.t('annotation.empty_tags_list')}
                            className="basic-multi-select mb-2 custom-react-select"
                            classNamePrefix="select"
                        />

                        <label className="label">
                            <span className="label-text">{this.props.t('project.settings.delay')}</span>
                        </label>
                        <input type="number" placeholder="2" className="input input-bordered w-full max-w-xs" value={this.state.settings.delay}
                            onChange={(e) => this.setState({ settings: { ...this.state.settings, delay: e.target.value } })} />

                        <label className="label">
                            <span className="label-text">{this.props.t('project.settings.begin_first_anno')}</span>
                        </label>
                        <input type="checkbox" className="toggle toggle-toolsbar" checked={this.state.settings.startbyfirstanno} onChange={() => this.setState({ settings: { ...this.state.settings, startbyfirstanno: !this.state.settings.startbyfirstanno } })} />


                        <label className="label">
                            <span className="label-text">{this.props.t('project.settings.navigator')}</span>
                        </label>
                        <input type="checkbox" className="toggle toggle-navigator" checked={this.state.settings.showNavigator} onChange={() => this.setState({ settings: { ...this.state.settings, showNavigator: !this.state.settings.showNavigator } })} />

                        <label className="label">
                            <span className="label-text">
                                {this.props.t('project.settings.show_outlines')}
                            </span>
                        </label>
                        <input type="checkbox" className="toggle toggle-navigator"
                            checked={this.state.settings.showOutlines}
                            onChange={() => this.setState({
                                settings: {
                                    ...this.state.settings,
                                    showOutlines: !this.state.settings.showOutlines
                                }
                            })} />

                        <label className="label">
                            <span className="label-text">
                                {this.props.t('project.settings.show_eyes')}
                            </span>
                        </label>
                        <input type="checkbox" className="toggle toggle-navigator"
                            checked={this.state.settings.showEyes}
                            onChange={() => this.setState({
                                settings: {
                                    ...this.state.settings,
                                    showEyes: !this.state.settings.showEyes
                                }
                            })} />

                        <label className="label">
                            <span className="label-text">{this.props.t('project.settings.toolsbar')}</span>
                        </label>
                        <input type="checkbox" className="toggle toggle-toolsbar" checked={this.state.settings.displayToolbar} onChange={() => this.setState({ settings: { ...this.state.settings, displayToolbar: !this.state.settings.displayToolbar } })} />

                        <label className="label">
                            <span className="label-text">{this.props.t('project.settings.fullscreen')}</span>
                        </label>
                        <input type="checkbox" className="toggle toggle-toolsbar" checked={this.state.settings.toolsbarOnFs} onChange={() => this.setState({ settings: { ...this.state.settings, toolsbarOnFs: !this.state.settings.toolsbarOnFs } })} />

                        <label className="label">
                            <span className="label-text">{this.props.t('project.settings.annos_nav')}</span>
                        </label>
                        <input type="checkbox" className="toggle toggle-toolsbar" checked={this.state.settings.sidebarEnabled} onChange={() => this.setState({ settings: { ...this.state.settings, sidebarEnabled: !this.state.settings.sidebarEnabled } })} />

                        <label className="label">
                            <span className="label-text">{this.props.t('project.settings.enable_rota')}</span>
                        </label>
                        <input type="checkbox" className="toggle toggle-toolsbar" checked={this.state.settings.rotation} onChange={() => this.setState({ settings: { ...this.state.settings, rotation: !this.state.settings.rotation } })} />
                    </div>

                    <div className="metadata-editor-btns">
                        <button type="submit" className="btn" ><FontAwesomeIcon icon={faSave} className="mr-2" />  &nbsp; {this.props.t('project.settings.save')} </button>
                    </div>
                </form>
            </div>
        )
    }
}
export default withTranslation()(ProjectSettings);