
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Rocket } from 'lucide-react';
import { useState } from 'react';

const formSchema = z.object({
  topic: z.string(),
  numQuestions: z.coerce.number().min(1).max(50),
  timer: z.coerce.number().min(5).max(300),
  playerName: z.string().optional(),
});

export type QuizSetupFormValues = z.infer<typeof formSchema>;

const topics = [
    { value: 'un mélange de tout', label: 'Mélange de tout' },
    { value: 'lore', label: 'Lore' },
    { value: 'lieux d\'intérêt', label: 'Lieux d\'intérêt' },
    { value: 'vaisseaux', label: 'Vaisseaux' },
    { value: 'organisations', label: 'Organisations' },
    { value: 'mécaniques de jeu', label: 'Mécaniques de jeu' },
    { value: 'histoire de l\'UEE', label: 'Histoire de l\'UEE' },
    { value: 'races aliens', label: 'Races Aliens' },
    { value: 'systèmes stellaires', label: 'Systèmes Stellaires' },
];

const questionOptions = [3, 5, 10];
const timerOptions = [10, 15, 20, 30];

interface QuizSetupFormProps {
  onSubmit: (values: QuizSetupFormValues) => void;
  isLoading: boolean;
  showHeader?: boolean;
  showPlayerName?: boolean;
}

export function QuizSetupForm({ onSubmit, isLoading, showHeader = true, showPlayerName = false }: QuizSetupFormProps) {
  const [isCustomQuestions, setIsCustomQuestions] = useState(false);
  const [isCustomTimer, setIsCustomTimer] = useState(false);

  const customFormSchema = z.object({
    topic: z.string(),
    numQuestionsSelect: z.string(),
    numQuestionsCustom: z.coerce.number().optional(),
    timerSelect: z.string(),
    timerCustom: z.coerce.number().optional(),
    playerName: z.string().optional(),
  }).refine(data => {
    if (data.numQuestionsSelect === 'custom') {
      return data.numQuestionsCustom !== undefined && data.numQuestionsCustom >= 1 && data.numQuestionsCustom <= 50;
    }
    return true;
  }, {
    message: "Veuillez entrer un nombre entre 1 et 50.",
    path: ['numQuestionsCustom'],
  }).refine(data => {
    if (data.timerSelect === 'custom') {
      return data.timerCustom !== undefined && data.timerCustom >= 5 && data.timerCustom <= 300;
    }
    return true;
  }, {
    message: "Veuillez entrer un nombre entre 5 et 300.",
    path: ['timerCustom'],
  });

  type CustomFormValues = z.infer<typeof customFormSchema>;

  const form = useForm<CustomFormValues>({
    resolver: zodResolver(customFormSchema),
    defaultValues: {
      topic: 'un mélange de tout',
      numQuestionsSelect: '5',
      timerSelect: '15',
      numQuestionsCustom: undefined,
      timerCustom: undefined,
      playerName: '',
    },
  });

  const handleFormSubmit = (values: CustomFormValues) => {
    const finalValues: QuizSetupFormValues = {
      topic: values.topic,
      numQuestions: values.numQuestionsSelect === 'custom' ? values.numQuestionsCustom! : Number(values.numQuestionsSelect),
      timer: values.timerSelect === 'custom' ? values.timerCustom! : Number(values.timerSelect),
      playerName: values.playerName,
    };
    onSubmit(finalValues);
  };


  return (
    <Card className="border-primary/20 shadow-lg shadow-primary/10">
      {showHeader && (
        <CardHeader className="text-center">
          <CardTitle className="text-4xl md:text-5xl font-headline tracking-wider text-primary">POLYQUIZ</CardTitle>
          <CardDescription className="text-foreground/80 pt-2">
            Testez vos connaissances de l'univers de Star Citizen.
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className={!showHeader ? "pt-6" : ""}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            {showPlayerName && (
               <FormField
                  control={form.control}
                  name="playerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Votre Nom</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom de l'hôte" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            )}
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sujet</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un sujet" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {topics.map((topic) => (
                        <SelectItem key={topic.value} value={topic.value}>
                          {topic.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="numQuestionsSelect"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de questions</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setIsCustomQuestions(value === 'custom');
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez le nombre de questions" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {questionOptions.map((num) => (
                        <SelectItem key={num} value={String(num)}>
                          {num} Questions
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Personnalisé...</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isCustomQuestions && (
              <FormField
                control={form.control}
                name="numQuestionsCustom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de questions personnalisé</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 7" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="timerSelect"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temps par question</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setIsCustomTimer(value === 'custom');
                    }}
                    defaultValue={String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez le temps par question" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timerOptions.map((timer) => (
                        <SelectItem key={timer} value={String(timer)}>
                          {timer} secondes
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Personnalisé...</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isCustomTimer && (
              <FormField
                control={form.control}
                name="timerCustom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temps par question personnalisé (secondes)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 25" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Génération du quiz...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-5 w-5" />
                  Démarrer le quiz
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
