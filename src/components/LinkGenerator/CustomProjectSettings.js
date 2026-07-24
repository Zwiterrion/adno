import { withTranslation } from "react-i18next";

import ReactSelect from 'react-select';

const QUARTER_TURNS = [0, 90, 180, 270]

const OUTLINE_WIDTHS = ['outline-1px', 'outline-2px', 'outline-3px', 'outline-5px', 'outline-8px']

const OUTLINE_COLORS = [
    { name: 'white', swatch: 'bg-white checked:bg-white' },
    { name: 'red', swatch: 'bg-red-500 checked:bg-red-500' },
    { name: 'orange', swatch: 'bg-amber-500 checked:bg-amber-500' },
    { name: 'yellow', swatch: 'bg-yellow-300 checked:bg-yellow-300' },
    { name: 'green', swatch: 'bg-lime-500 checked:bg-lime-500' },
    { name: 'blue', swatch: 'bg-blue-400 checked:bg-blue-400' },
    { name: 'violet', swatch: 'bg-violet-500 checked:bg-violet-500' },
    { name: 'black', swatch: 'bg-black checked:bg-black' }
]

const Section = ({ title, children }) => (
    <section className="rounded-lg bg-white p-4 shadow-sm h-fit">
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
        <div className="divide-y divide-slate-100">{children}</div>
    </section>
)

const Row = ({ label, children }) => (
    <label className="flex items-center justify-between gap-4 py-2 cursor-pointer">
        <span className="label-text flex-1">{label}</span>
        {children}
    </label>
)

const Stack = ({ label, children }) => (
    <div className="py-2">
        <span className="label-text mb-2 block">{label}</span>
        {children}
    </div>
)

const ColorPicker = ({ group, prefix, value, onPick }) => (
    <div className="flex flex-wrap gap-3 rounded-lg bg-gray-100 p-3 w-fit">
        {OUTLINE_COLORS.map(color => (
            <input type="radio"
                key={color.name}
                name={group}
                value={prefix + color.name}
                className={`h-4 w-4 p-4 border-8 border-slate-200 checked:border-slate-800 radio rounded-lg cursor-pointer ${color.swatch}`}
                checked={value === prefix + color.name}
                onChange={() => { }}
                onClick={e => onPick(e.target.value)}
            />
        ))}
    </div>
)

function CustomProjectSettings({ t, settings, setSettings }) {

    const soundsMode = [{
        label: t('project.settings.no_sound'),
        value: 'no_sound'
    },
    {
        label: t('project.settings.no_spatialization'),
        value: 'no_spatialization'
    },
    {
        label: t('project.settings.spatialization'),
        value: 'spatialization'
    }]

    const set = (name, value) => setSettings({ ...settings, [name]: value })

    const toggle = (name) => set(name, !settings[name])

    const handleColor = (name, newColor) => set(name, settings[name] !== newColor ? newColor : false)

    return <div className="mt-4 grid gap-4 2xl:grid-cols-2 items-start">

        <Section title={t('project.settings.visualization')}>
            <Row label={t('project.settings.navigator')}>
                <input type="checkbox" className="toggle toggle-navigator" checked={!!settings.showNavigator}
                    onChange={() => toggle('showNavigator')} />
            </Row>

            <Row label={t('project.settings.toolsbar')}>
                <input type="checkbox" className="toggle toggle-toolsbar" checked={!!settings.displayToolbar}
                    onChange={() => toggle('displayToolbar')} />
            </Row>

            <Row label={t('project.settings.fullscreen')}>
                <input type="checkbox" className="toggle toggle-toolsbar" checked={!!settings.toolsbarOnFs}
                    onChange={() => toggle('toolsbarOnFs')} />
            </Row>

            <Row label={t('project.settings.show_outlines')}>
                <input type="checkbox" className="toggle toggle-navigator" checked={!!settings.showOutlines}
                    onChange={() => toggle('showOutlines')} />
            </Row>

            <Row label={t('project.settings.show_only_current_annotation')}>
                <input type="checkbox" className="toggle toggle-navigator" checked={!!settings.showCurrentAnnotation}
                    onChange={() => toggle('showCurrentAnnotation')} />
            </Row>

            <Row label={t('project.settings.show_eyes')}>
                <input type="checkbox" className="toggle toggle-navigator" checked={!!settings.showEyes}
                    onChange={() => toggle('showEyes')} />
            </Row>

            <Row label={t('project.settings.anno_bounds')}>
                <input type="checkbox" className="toggle toggle-toolsbar" checked={!!settings.annoBounds}
                    onChange={() => toggle('annoBounds')} />
            </Row>

            <Row label={t('project.settings.enable_rota')}>
                <input type="checkbox" className="toggle toggle-toolsbar" checked={!!settings.rotation}
                    onChange={() => toggle('rotation')} />
            </Row>

            <Row label={t('project.settings.default_rotation')}>
                <select className="select select-bordered select-sm"
                    value={settings.defaultRotation ?? 0}
                    onChange={(e) => set('defaultRotation', Number(e.target.value))}>
                    {QUARTER_TURNS.map(degrees => <option key={degrees} value={degrees}>{degrees}°</option>)}
                </select>
            </Row>

            <Row label={t('project.settings.rotation_transition')}>
                <select className="select select-bordered select-sm"
                    value={settings.rotationTransition || 'turn'}
                    onChange={(e) => set('rotationTransition', e.target.value)}>
                    <option value="turn">{t('project.settings.rotation_transition_turn')}</option>
                    <option value="instant">{t('project.settings.rotation_transition_instant')}</option>
                </select>
            </Row>
        </Section>

        <Section title={t('project.settings.navigation')}>
            <Row label={t('project.settings.delay')}>
                <input type="number" placeholder="2" className="input input-bordered input-sm w-24"
                    value={settings.delay}
                    onChange={(e) => set('delay', e.target.value)} />
            </Row>

            <Row label={t('project.settings.begin_first_anno')}>
                <input type="checkbox" className="toggle toggle-toolsbar" checked={!!settings.startbyfirstanno}
                    onChange={() => toggle('startbyfirstanno')} />
            </Row>

            <Row label={t('project.settings.should_auto_play_annotations')}>
                <input type="checkbox" className="toggle toggle-toolsbar" checked={!!settings.shouldAutoPlayAnnotations}
                    onChange={() => toggle('shouldAutoPlayAnnotations')} />
            </Row>

            <Stack label={t('project.settings.annotation_sound')}>
                <ReactSelect
                    name="sound_mode"
                    options={soundsMode}
                    value={soundsMode.find(f => f.value === settings?.soundMode)}
                    defaultValue={soundsMode.find(f => f.value === 'no_sound')}
                    onChange={soundMode => set('soundMode', soundMode?.value)}
                    placeholder={t('project.settings.annotation_sound')}
                    className="basic-multi-select custom-react-select"
                    classNamePrefix="select"
                />
            </Stack>
        </Section>

        <Section title={t('project.settings.annotation')}>
            <Stack label={t('project.settings.outline_width')}>
                <select size="5" className="input input-bordered h-fit w-full font-mono outline-select"
                    value={settings.outlineWidth}
                    onChange={(e) => set('outlineWidth', e.target.value)}>
                    {OUTLINE_WIDTHS.map(width =>
                        <option key={width} value={width} className={width}>{width.replace('outline-', '')}</option>
                    )}
                </select>
            </Stack>

            <Stack label={t('project.settings.outline_color')}>
                <ColorPicker group="color" prefix="outline-"
                    value={settings.outlineColor}
                    onPick={value => handleColor('outlineColor', value)} />
            </Stack>

            <Stack label={t('project.settings.outline_focus')}>
                <ColorPicker group="focus" prefix="outline-focus-"
                    value={settings.outlineColorFocus}
                    onPick={value => handleColor('outlineColorFocus', value)} />
            </Stack>
        </Section>

    </div>
}

export default withTranslation()(CustomProjectSettings)
