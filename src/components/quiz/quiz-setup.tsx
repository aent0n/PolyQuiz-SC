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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Rocket } from 'lucide-react';

const formSchema = z.object({
  topic: z.string(),
  numQuestions: z.coerce.number().min(3).max(10),
});

type QuizSetupFormValues = z.infer<typeof formSchema>;

const topics = [
  { value: 'lore', label: 'Lore' },
  { value: 'locations', label: 'Points of Interest' },
  { value: 'resources', label: 'Resources' },
  { value: 'ships', label: 'Ships' },
  { value: 'organizations', label: 'Organizations' },
];

interface QuizSetupFormProps {
  onSubmit: (values: QuizSetupFormValues) => void;
  isLoading: boolean;
}

export function QuizSetupForm({ onSubmit, isLoading }: QuizSetupFormProps) {
  const form = useForm<QuizSetupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: 'lore',
      numQuestions: 5,
    },
  });

  return (
    <Card className="border-primary/20 shadow-lg shadow-primary/10">
      <CardHeader className="text-center">
        <CardTitle className="text-4xl md:text-5xl font-bold tracking-wider text-primary">POLYQUIZ</CardTitle>
        <CardDescription className="text-foreground/80 pt-2">
          Test your knowledge of the Star Citizen universe.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a topic" />
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
              name="numQuestions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Questions</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select number of questions" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[3, 5, 10].map((num) => (
                        <SelectItem key={num} value={String(num)}>
                          {num} Questions
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Quiz...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-5 w-5" />
                  Start Quiz
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
