import { useState} from 'react';
import useInit from '@/hooks/useInit';
import {Form,Switch,Select,Radio,Input} from 'antd'
import { speakers, celebrity} from './Speakers';
import { FormInstance } from 'antd/lib/form';

export default function LangHelper({ form }: { form: FormInstance }) {

    const Speech_Type_List = ['web','ai','azure','iflytek'];
    // web, ai,azure, iflytek
    const Rec_Type_List = ['web','iflytek','ai'];
    //iflytek, speechsuper
    const Assess_Type_List = ['','iflytek','speechsuper'];

    const Special_Speech_Mode =['accent_per_sentence',"region_per_passage"]
    const [selectSpeech, setSelectSpeech] = useState('')
    const [selectRec,setSelectRec]  = useState('');
    const [selectAssess,setSelectAssess]  = useState('');
    
    useInit(() => {
        setSelectSpeech(form.getFieldValue('speech_type'));
        setSelectRec(form.getFieldValue('rec_type'));
        setSelectAssess(form.getFieldValue('assess_type'));
    });
    return (
      <>
        <Form.Item label="Talk mode" name="talk_mode" valuePropName="checked">
            <Switch />
        </Form.Item>
        <Form.Item label = "Speech Type" name="speech_type">
            <Select onChange={(v) =>{setSelectSpeech(v)}}>
                { Speech_Type_List.map((s:string) =>{
                    return (
                        <Select.Option key={s} value={s}>
                            {s}
                        </Select.Option>
                    );
                })}
            </Select>
        </Form.Item>
        <Form.Item label = "Recognition Type" name="rec_type">
            <Select onChange={(v)=>{setSelectRec(v)}}>
                { Rec_Type_List.map((s:string) =>{
                    return (
                        <Select.Option key={s} value={s}>
                            {s}
                        </Select.Option>
                    );
                })}
            </Select>
        </Form.Item>
        <Form.Item label = "Assessment Type" name="assess_type">
            <Select onChange={(v) =>{setSelectAssess(v)}}>
                { Assess_Type_List.map((s:string) =>{
                    return (
                        <Select.Option key={s} value={s}>
                            {s}
                        </Select.Option>
                    );
                })}
            </Select>
        </Form.Item>
        { selectSpeech === "ai" && (
            <Form.Item label="Hundreds ai Accents" name="speech_ai_lang">
                <Select>
                    {Special_Speech_Mode.map((s:string)=>{
                        return (
                            <Select.Option key={s} value ={s}>
                                {s}
                            </Select.Option>
                        );
                    })}
                    {speakers.map((l:string[])=>{
                        const speaker = l.join("-");
                        return (
                            <Select.Option key={speaker} value ={speaker}>
                                {speaker}
                            </Select.Option>
                        );
                    })}
                    {celebrity.map((s:string)=>{
                        return (
                            <Select.Option key={s} value ={s}>
                                {s}
                            </Select.Option>
                        );
                    })}
                </Select>
            </Form.Item>
        )}
         { selectSpeech === "ai" && (
            <Form.Item label="AI speech subprocess number" name="subprocess_number">
                <Radio.Group>
                    <Radio value="1">1</Radio>
                    <Radio value="2">2</Radio>
                    <Radio value="3">3</Radio>
                </Radio.Group>
          </Form.Item>
        )}
        { selectRec === "iflytek" && (
            <Form.Item label="iflytek Rec AppId" name="iflytek_rec_appid">
                <Input placeholder="input your iflytek Rec AppId"/>
            </Form.Item>
        )}
        { selectRec === "iflytek" && (
            <Form.Item label="iflytek Rec ApiKey" name="iflytek_rec_apikey">
                <Input placeholder="input your iflytek Rec ApiKey"/>
            </Form.Item>
        )}
        { selectRec === "iflytek" && (
            <Form.Item label="iflytek Rec Lang" name="rec_iflytek_lang">
                <Radio.Group>
                    <Radio value="cn">ch&en</Radio>
                    <Radio value="en">en</Radio>
                </Radio.Group>
            </Form.Item>
        )}
        { selectAssess === "iflytek" && (
            <Form.Item label="iflytek Assess AppId" name="iflytek_assess_appid">
                <Input placeholder="input your iflytek Assess AppId"/>
            </Form.Item>
        )}
        { selectAssess === "iflytek" && (
            <Form.Item label="iflytek Assess ApiSecret" name="iflytek_assess_appsecret">
                <Input placeholder="input your iflytek Assess ApiSecret"/>
            </Form.Item>
        )}
        { selectAssess === "iflytek" && (
            <Form.Item label="iflytek Assess ApiKey" name="iflytek_assess_apikey">
                <Input placeholder="input your iflytek Assess ApiKey"/>
            </Form.Item>
        )}
        { selectAssess === "speechsuper" && (
            <Form.Item label="speechsuper Assess AppKey" name="ss_assess_appkey">
                <Input placeholder="input your speechsuper Assess AppKey"/>
            </Form.Item>
        )}
        { selectAssess === "speechsuper" && (
            <Form.Item label="speechsuper Assess SecretKey" name="ss_assess_secretkey">
                <Input placeholder="input your speechsuper Assess SecretKey"/>
            </Form.Item>
        )}
      </>
    );
}
  