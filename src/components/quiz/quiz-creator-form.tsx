'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlusCircle, Save, Trash2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';

const questionSchema = z.object({
  question: z.string().min(1, 'La question ne peut pas être vide.'),
  options: z.tuple([
    z.string().min(1, "L'option ne peut pas être vide."),
    z.string().min(1, "L'option ne peut pas être vide."),
    z.string().min(1, "L'option ne peut pas être vide."),
    z.string().min(1, "L'option ne peut pas être vide."),
  ]),
  answer: z.string().min(1, 'Vous devez sélectionner une réponse.'),
});

const quizCreatorSchema = z.object({
  title: z.string().min(1, 'Le titre du quiz est requis.'),
  questions: z.array(questionSchema).min(1, 'Un quiz doit avoir au moins une question.'),
});

type QuizCreatorFormValues = z.infer<typeof quizCreatorSchema>;

interface QuizCreatorFormProps {
  onSave: (data: QuizCreatorFormValues) => void;
}

export function QuizCreatorForm({ onSave }: QuizCreatorFormProps) {
  const form = useForm<QuizCreatorFormValues>({
    resolver: zodResolver(quizCreatorSchema),
    defaultValues: {
      title: '',
      questions: [
        {
          question: '',
          options: ['', '', '', ''],
          answer: '',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'questions',
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg">Titre du Quiz</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Vaisseaux célèbres de l'UEE" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {fields.map((field, index) => (
          <Card key={field.id} className="border-primary/30 pt-4">
            <CardHeader className="flex flex-row items-center justify-between py-2">
              <CardTitle className="text-xl">Question {index + 1}</CardTitle>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-5 w-5 text-destructive" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name={`questions.${index}.question`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Texte de la question</FormLabel>
                    <FormControl>
                      <Input placeholder="Quelle est la capitale de la Terre ?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Controller
                control={form.control}
                name={`questions.${index}.answer`}
                render={({ field: answerField }) => (
                  <RadioGroup
                    onValueChange={answerField.onChange}
                    defaultValue={answerField.value}
                    className="space-y-2"
                  >
                    <FormLabel>Options (sélectionnez la bonne réponse)</FormLabel>
                    {[0, 1, 2, 3].map((optionIndex) => (
                      <FormField
                        key={optionIndex}
                        control={form.control}
                        name={`questions.${index}.options.${optionIndex}`}
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                                <RadioGroupItem value={field.value} id={`${field.name}-${optionIndex}`} />
                            </FormControl>
                            <Input {...field} placeholder={`Option ${optionIndex + 1}`} />
                          </FormItem>
                        )}
                      />
                    ))}
                  </RadioGroup>
                )}
              />
               <FormMessage>{form.formState.errors.questions?.[index]?.answer?.message}</FormMessage>

            </CardContent>
          </Card>
        ))}
        
        <Separator />

        <div className="flex justify-between items-center">
            <Button
                type="button"
                variant="outline"
                onClick={() => append({ question: '', options: ['', '', '', ''], answer: '' })}
            >
                <PlusCircle className="mr-2 h-4 w-4" />
                Ajouter une question
            </Button>
            <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Sauvegarder le Quiz
            </Button>
        </div>
      </form>
    </Form>
  );
}
